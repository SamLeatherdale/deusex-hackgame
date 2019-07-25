import LevelData, {LevelEdgeDirection, NodeType, Point} from "./LevelData";
import LevelNode from "./LevelNode";
import NodeConnection from "./NodeConnection";
import {TypedObj} from "../shared";
import _ from "lodash";

export enum LevelStatus {
    INCOMPLETE,
    COMPLETE,
    FAILED
}

export default class Level {
    nodes: TypedObj<LevelNode> = {}; //Matrix of nodes, by columns, then rows
    gridRows = 0;
    gridColumns = 0;
    connections: NodeConnection[] = [];
    status: LevelStatus = LevelStatus.INCOMPLETE;

    isPlayerDetected = false;
    stopWormActive = false;

    lastUpdated: number;

    constructor(level: LevelData) {
        //Adjust base to 0
        const smallestX = level.nodes.reduce((smallest, node) => {return node.x < smallest ? node.x : smallest}, 999);
        const smallestY = level.nodes.reduce((smallest, node) => {return node.y < smallest ? node.y : smallest}, 999);
        const nodes = level.nodes.map(node => {
            node.x -= smallestX;
            node.y -= smallestY;
            return node;
        });

        //Get grid size
        const largestX = nodes.reduce((largest, node) => {return node.x > largest ? node.x : largest}, -999);
        const largestY = nodes.reduce((largest, node) => {return node.y > largest ? node.y : largest}, -999);

        this.gridRows = largestY;
        this.gridColumns = largestX;
        //this.nodes = Array.from(Array(largestX), () => new Array(largestY));

        //Create and add nodes
        for (let nodeConfig of nodes) {
            const node = new LevelNode(nodeConfig);
            this.setNode(node);
        }



        level.edges.forEach((edgeConfig) => {
            let [first, second, direction] = edgeConfig;
            let from: Point, to: Point;
            for (let i = 0; i < 2; i++) {
                first[0] -= smallestX;
                second[1] -= smallestY;
            }

            if (direction === LevelEdgeDirection.LTR || direction === LevelEdgeDirection.BI) {
                from = first;
                to = second;
            } else { //RTL
                from = second;
                to = first;
            }

            const fromNode = this.getNode(...from);
            const toNode = this.getNode(...to);

            for (const node of [fromNode, toNode]) {
                if (typeof node === "undefined") {
                    console.error(`Cell [${from.join(',')}] does not exist.`);
                    return;
                }
            }

            let connection = new NodeConnection(fromNode, toNode, direction === LevelEdgeDirection.BI);
            fromNode.addConnection(connection);
            toNode.addConnection(connection);
            this.connections.push(connection);
        });
    }

    updatePath(obj: TypedObj<any>): void {
        for (let path of Object.keys(obj)) {
            _.set(this, path, obj[path]);
        }
        this.lastUpdated = Date.now();
    }

    isComplete(): boolean {
        return this.status !== LevelStatus.INCOMPLETE;
    }

    goalCaptured(): boolean {
        const servers = this.getNodesByType(NodeType.SERVER);
        const exits = this.getNodesByType(NodeType.EXIT);

        for (const nodes of [servers, exits]) {
            if (nodes.every(node => node.isCaptured())) {
                return true;
            }
        }

        return false;
    }

    /**
     * @param x   The column, or x value.
     * @param y   The row, or y value.
     */
    getNode(x: number, y: number): LevelNode {
        //return this.nodes[col][row];
        return this.nodes[LevelNode.getKey(x, y)];

    }

    getNodeKey(key: string): LevelNode {
        return this.nodes[key];
    }

    setNode(node: LevelNode) {
        //this.nodes[node.col][node.row] = node;
        this.nodes[node.key] = node;
    }

    getRowCount(): number {
        //return this.nodes[0].length;
        return this.gridRows;
    }

    getColCount(): number {
        //return this.nodes.length;
        return this.gridColumns;
    }

    getNodesByType(type: NodeType): LevelNode[] {
        return Object.values(this.nodes).filter(node => node.type === type);
    }
}
