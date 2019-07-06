import {NodeData} from "../types/LevelData";
import NodeConnection from "./NodeConnection";

export default class LevelNode extends NodeData {
    row: number;
    col: number;
    key: string;
    connections: NodeConnection[] = [];

    BOUND_WIDTH = 150;
    BOUND_HEIGHT = 150;
    DRAW_WIDTH = 80;
    DRAW_HEIGHT = 80;

    static getKey(x: number, y: number) {
        return `${x},${y}`;
    }

    constructor(config: NodeData) {
        super();
        Object.assign(this, config); //Copy JSON properties over
        this.row = config.y;
        this.col = config.x;
        this.key = LevelNode.getKey(this.x, this.y);
    }

    addConnection(connection: NodeConnection) {
        this.connections.push(connection);
    }
}