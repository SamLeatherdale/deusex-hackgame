import {NodeData, NodeType} from "../types/LevelData";
import NodeConnection from "./NodeConnection";
import {TypedObj} from "../types/shared";
import _ from "lodash";

export default class LevelNode extends NodeData {
    lastUpdated: number;
    row: number;
    col: number;
    key: string;
    connections: NodeConnection[] = [];

    captured = false;

    static getKey(x: number, y: number) {
        return `${x},${y}`;
    }

    /**
     *
     * @param config    A NodeData config object, or an existing instance to clone.
     */
    constructor(config: NodeData) {
        super();
        Object.assign(this, config); //Copy JSON properties over
        if (typeof this.key === "undefined") {
            this.init(config);
        }
    }

    init(config: NodeData) {
        this.row = config.y;
        this.col = config.x;
        this.key = LevelNode.getKey(this.x, this.y);

        //Automatically enable entry nodes
        if (this.type === NodeType.ENTRY) {
            this.captured = true;
        }
    }

    updatePath(obj: TypedObj<any>): void {
        for (let path of Object.keys(obj)) {
            _.set(this, path, obj[path]);
        }
        this.lastUpdated = Date.now();
    }

    /**
     * Returns a new object with the provided object of values applied to it.
     * @param obj
     */
    updateImmutablePath(obj: TypedObj<any>): LevelNode {
        const o = new LevelNode(this);
        o.updatePath(obj);
        return o;
    }

    equals(node: LevelNode): boolean {
        return this.key === node.key;
    }

    addConnection(connection: NodeConnection) {
        this.connections.push(connection);
    }

    isDisabled() {
        return !(this.captured || this.isConnectedToCaptured());
    }

    canBeCaptured() {
        return (this.isConnectedToCaptured() && !this.isDisabled());
    }

    isConnectedToCaptured() {
        for (const conn of this.connections) {
            if (conn.endsWith(this)) {
                const node = conn.getOtherNode(this);
                if (node.captured) {
                    return true;
                }
            }
        }
        return false;
    }

    appearsCaptured() {
        return this.captured && this.type !== NodeType.ENTRY;
    }
}
