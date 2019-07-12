import LevelNode from "./classes/LevelNode";

export const DXBorderColor = "#eca723";
export const DXBGLight = "#c58d22";
export const DXBGDefault = "#0d0d0d";

export type TypedObjKey = string | number;
export type TypedObj<T> = {
    [key in TypedObjKey]: T;
}

export type NodeSelection = LevelNode | LevelNode[] | boolean;

export function genericCompare(val1: any, val2: any): number {
    if (val1 < val2) {
        return -1;
    }
    return val1 > val2 ? 1 : 0;
}

export function condAttr(condition, truthValue: any = "") {
    return condition ? truthValue : undefined;
}

export function leftPad(str: string, len: number, pad: string = "0"): string {
    return pad.repeat(len - str.length) + str;
}