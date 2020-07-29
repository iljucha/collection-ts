// @ts-check
import { logic } from "./methods";
import { QueryOption, Query, LogicGate } from "./types";

export const LOGICGATES: LogicGate = {
    $or: (queryArr: QueryOption, item: any): boolean => queryArr.some((query: Query) => {
        const keys = Object.keys(query);
        return keys.every(key => logic(query, item, key));
    }),
    $and: (queryArr: QueryOption, item: any): boolean => queryArr.every((query: Query) => {
        const keys = Object.keys(query);
        return keys.every(key => logic(query, item, key));
    })
}