import LevelNode from "./classes/LevelNode";

export type TypedObjKey = string | number;
export type TypedObj<T> = {
    [key in TypedObjKey]: T;
}

export type NodeSelection = LevelNode | LevelNode[] | boolean;

export function genericCompare(val1: any, val2: any) {
    if (val1 < val2) {
        return -1;
    }
    return val1 > val2 ? 1 : 0;
}

export function condAttr(condition, truthValue: any = "") {
    return condition ? truthValue : undefined;
}
