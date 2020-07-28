// @ts-check
import { logic } from "./methods";
import { QueryOption } from "./types";

export const LOGICGATES = {
    $or: (queryArr: QueryOption, item: any): boolean => queryArr.some(query => {
        const keys = Object.keys(query);
        return keys.every(key => logic(query, item, key));
    }),
    $and: (queryArr: QueryOption, item: any): boolean => queryArr.every(query => {
        const keys = Object.keys(query);
        return keys.every(key => logic(query, item, key));
    })
}