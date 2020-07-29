import { getType } from "./methods";
import { Comparable, Logic } from "./types";

export const LOGICS: Logic = {
    $regexp: (regexp: RegExp, str: string): boolean => regexp.test(str),
    $includes: (substr: string, str: string): boolean => str.includes(substr),
    $eq: (val1: any, val2: any): boolean => val1 === val2,
    $ne: (val1: any, val2: any): boolean => val1 !== val2,
    $lt: (val1: Comparable, val2: Comparable): boolean => {
        val1 = typeof val1 === "string" ? val1.length : val1
        val2 = typeof val2 === "string" ? val2.length : val2
        return val2 < val1
    },
    $lte: (val1: Comparable, val2: Comparable): boolean => {
        val1 = typeof val1 === "string" ? val1.length : val1
        val2 = typeof val2 === "string" ? val2.length : val2
        return val2 <= val1
    },
    $gt: (val1: Comparable, val2: Comparable): boolean => {
        val1 = typeof val1 === "string" ? val1.length : val1
        val2 = typeof val2 === "string" ? val2.length : val2
        return val2 > val1
    },
    $gte: (val1: Comparable, val2: Comparable): boolean => {
        val1 = typeof val1 === "string" ? val1.length : val1
        val2 = typeof val2 === "string" ? val2.length : val2
        return val2 >= val1
    },
    $in: (arr: any[], val: any): boolean => arr.indexOf(val) >= 0,
    $nin: (arr: any[], val: any): boolean => arr.indexOf(val) === -1,
    $exists: (bool: boolean, val: any): boolean => bool === true ? (val ? true : false) : (val ? false : true),
    $type: (type: string, val: any): boolean => type === getType(val)
}
