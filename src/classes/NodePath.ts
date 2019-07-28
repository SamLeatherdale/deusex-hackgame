import LevelNode from "./LevelNode";
import Player from "./Player";
import {genericCompare} from "../shared";
import NodeConnection from "./NodeConnection";
import {DEBUG_MODE} from "../index";
import {NodeType} from "./LevelData";

export default class NodePath {
    start: LevelNode;
    visited: Map<string, LevelNode> = new Map();
    path: LevelNode[] = [];
    completed = false;
    captureTime = 0;

    constructor(start?: LevelNode) {
        this.start = start;
        this.addNode(start);
    }

    clone(): NodePath {
        const clone = new NodePath(this.start);
        clone.visited = new Map(this.visited); //Shallow copy
        clone.path = this.path.slice(); //Shallow copy
        clone.completed = this.completed;
        return clone;
    }

    toString(): string {
        return this.path.map(node => node.toString()).join(' => ');
    }

    addNode(node: LevelNode) {
        this.visited.set(node.key, node);
        this.path.push(node);
    }

    seen(node: LevelNode): boolean {
        return typeof this.visited.get(node.key) !== "undefined";
    }

    getLastNode(): LevelNode {
        return this.path[this.path.length - 1];
    }

    /**
     * Gets all next possible nodes that we haven't seen yet.
     */
    getNextNodes(): LevelNode[] {
        return this.getLastNode().getConnectedNodes().filter(node => !this.seen(node));
    }

    /**
     * Gets connections that connect the nodes in the path.
     */
    getPathConnections(): NodeConnection[] {
        const conns: Set<NodeConnection> = new Set();
        for (let i = 0; i < this.path.length - 1; i++) {
            const a = this.path[i];
            const b = this.path[i + 1];
            conns.add(a.getConnection(b));
        }
        return Array.from(conns.values());
    }

    calculateCaptureTime(server: Player) {
        const nodes = this.path.filter(node => node.type !== NodeType.SERVER); //node.serverCaptured === CaptureStatus.NONE);

        //Calculate capture time for nodes
        const nodeTimes = nodes.map(node => node.getCaptureTime(server));
        const nodeTime = nodeTimes.reduce((sum, t) => sum + t, 0);

        //Add in time for connections
        const conns = this.getPathConnections(); //.filter(conn => conn.serverCaptured === CaptureStatus.NONE);
        const connTime = conns.length * NodeConnection.getCaptureTime(server);

        this.captureTime = nodeTime + connTime;
        if (DEBUG_MODE) {
            console.log(`${nodeTimes.join(", ")} + ${conns.length} x ${NodeConnection.getCaptureTime(server)}ms`);
        }
    }


    /**
     * Calculates the time to capture the goal node from the given nodes.
     */
    static calculateMinCaptureTime(server: Player, startNodes: LevelNode[], goalNodes: LevelNode[]) {
        const paths: Set<NodePath> = new Set();

        for (const start of startNodes) {
            paths.add(new NodePath(start));
        }

        //Start extending paths
        while (!Array.from(paths.values()).every(path => path.completed)) {
            for (const path of paths.values()) {
                if (path.completed) {
                    continue;
                }

                const nextNodes = path.getNextNodes();

                if (nextNodes.length === 0) {
                    //If we're not at goal state and have nowhere to go, should remove
                    paths.delete(path);
                    continue;
                }

                //Since we're creating new paths, this path can be removed
                paths.delete(path);
                for (const next of nextNodes) {
                    const clone = path.clone();
                    clone.addNode(next);
                    paths.add(clone);

                    if (goalNodes.includes(next)) {
                        clone.completed = true;
                    }
                }
            }
        }

        //Find path with lowest capture time
        const sortedPaths = Array.from(paths.values()).filter(path => path.completed);
        sortedPaths.forEach(path => path.calculateCaptureTime(server));
        sortedPaths.sort((a, b) => genericCompare(a.captureTime, b.captureTime));

        const shortest = sortedPaths[0];
        if (DEBUG_MODE) {
            console.log(shortest.toString());
        }

        return shortest.captureTime;
    }
}
