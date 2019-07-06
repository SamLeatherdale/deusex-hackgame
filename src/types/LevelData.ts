export default interface LevelData {
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
    BI = "bi"
}

export enum NodeType {
    EXIT = "exit",
    FOLDER = "folder",
    ENTRY = "entry",
    DATA = "data",
    API = "api",
    SERVER = "server"
}

enum NodeAPIType {
    SPAM = "spam"
}