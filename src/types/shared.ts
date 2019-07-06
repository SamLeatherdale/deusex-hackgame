export type TypedObjKey = string | number;
export type TypedObj<T> = {
    [key in TypedObjKey]: T;
}