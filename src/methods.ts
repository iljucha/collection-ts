import {
    Comparable,
    Logic,
    LogicGate,
    QueryOption,
    Query,
    CursorOptions,
    executableLogic,
    executableLogicGate
} from "./types";

const LOGICS: Logic = {
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

const LOGICGATES: LogicGate = {
    $or: (queryArr: QueryOption, item: any): boolean => queryArr.some((query: Query) => {
        const keys = Object.keys(query);
        return keys.every(key => logic(query, item, key));
    }),
    $and: (queryArr: QueryOption, item: any): boolean => queryArr.every((query: Query) => {
        const keys = Object.keys(query);
        return keys.every(key => logic(query, item, key));
    })
}

function getType(value: any): string {
    let type = typeof value;
    if (type === "object") {
        return value ? Object.prototype.toString.call(value).slice(8, -1) : "null";
    }
    return type;
}

export function assert(condition: any, message: string): void {
    if (!condition) {
        throw new Error(message);
    }
}

function logic(queryOption: QueryOption, item: any, key: string): boolean {
    let $logic: executableLogic;
    const keys: string[] = Object.keys(queryOption[key])
    const kLength: number = keys.length;
    let i: number = 0
    for (i; i < kLength; i++) {
        $logic = LOGICS[keys[i]];
        if (!item[key] || !$logic || !$logic(queryOption[key][keys[i]], item[key])) {
            return false;
        }
    }
    return true;
}

function isObject(value: any): boolean {
    return value !== null && Object.prototype.toString.call(value) === "[object Object]"
}

function flatten(obj: any, path: any = null): any {
    let value: any;
    let newPath: string;
    return Object.keys(obj).reduce((acc, key) => {
        value = obj[key];
        newPath = [path, key].filter(Boolean).join(".");
        return isObject(value)
            ? { ...acc, ...flatten(value, newPath) }
            : { ...acc, ...{ [newPath]: value } };
    }, {});
}

function match(query: Query, item: any, keys: string[]): boolean {
    let $logicGate: executableLogicGate;
    const copy: any = flatten({ ...item });
    let queryValue: any;
    return keys.every((key: string, index: number, array: string[]) => {
        // @ts-ignore
        queryValue = query[key];
        if (queryValue === copy[key]) {
            return true;
        }
        else if (typeof queryValue === "object") {
            if (logic(query, copy, key)) {
                return true;
            }
            $logicGate = LOGICGATES[key];
            if ($logicGate) {
                return $logicGate(queryValue, copy);
            }
        }
        return false;
    })
}

const findOptions: CursorOptions = {
    $skip: 0,
    $limit: Infinity,
    $reverse: false
}

export async function find(query: Query, items: any[], options: CursorOptions): Promise<any[]> {
    return findSync(query, items, options);
}

export function findSync(query: Query = {}, items: any[] = [], options: CursorOptions): any[] {
    options = { ...findOptions, ...options };
    let { $limit, $reverse, $skip } = options;
    let skipped: number = 0;
    let item: any;
    const len: number = items.length;
    const results: any[] = [];
    const keys: string[] = Object.keys(query);
    let i = $reverse === false ? 0 : (len - 1);
    if ($limit <= 0) {
        return results;
    }
    if ($skip < 0) {
        $skip = 0;
    }
    const next = () => $reverse === false ? i++ : i--;
    while (items[i] && results.length !== $limit) {
        item = items[i];
        if (match(query, item, keys)) {
            $skip <= skipped ? results.push(item) : skipped++;
        }
        next();
    }
    return results;
}
