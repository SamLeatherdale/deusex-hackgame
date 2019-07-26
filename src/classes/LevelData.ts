export default class LevelData {
    title: string;
    nodes: NodeData[];
    edges: LevelEdgeData[];
}

export class NodeData {
    x: number;
    y: number;
    type: NodeType;
    level: number;
    api?: NodeAPIType
}

export type Point = [number, number];
export interface PointObj {
    x: number;
    y: number
}

type LevelEdgeData = [Point, Point, LevelEdgeDirection];

export enum LevelEdgeDirection {
    LTR = "ltr",
    RTL = "rtl",
    BI = "bid"
}

export enum NodeType {
    API = "api",
    DATA = "data",
    ENTRY = "entry",
    EXIT = "exit",
    FOLDER = "folder",
    SERVER = "server"
}

enum NodeAPIType {
    CLEARANCE = "clearance",
    SPAM = "spam",
    SOFTEN = "soften",
    TRANSFER = "transfer"
}
