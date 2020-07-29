import { LOGICGATES } from "./logicgates";
import { LOGICS } from "./logics";
import {
    QueryOption,
    Query,
    CursorOptions,
    executableLogic,
    executableLogicGate
} from "./types";

export function getType(value: any): string {
    let type = typeof value;
    if (type === "object") {
        return value ? Object.prototype.toString.call(value).slice(8, -1) : "null";
    }
    return type;
}

function isObject(value: any): boolean {
    return value !== null && Object.prototype.toString.call(value) === "[object Object]";
}

function flatten(obj: any): any {
    return { ..._flatten(obj) };
}

function _flatten(child: any, path: any[] = []): any {
    let keys: string[] = Object.keys(child);
    let com: any = _combine(path, child, keys);
    return [].concat(...com);
}

function _combine(path: any[], child: any, keys: string[]): any {
    return keys.map((key: string) => {
        return isObject(child[key])
            ? _flatten(child[key], path.concat([key]))
            : ({ [path.concat([key]).join(".")] : child[key] })
        }
    )
}

export function assert(condition: any, message: string): void {
    if (!condition) {
        throw new Error(message);
    }
}

export function logic(queryOption: QueryOption, item: any, key: string): boolean {
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

function match(query: Query, item: any, keys: string[]): boolean {
    let $logicGate: executableLogicGate;
    const copy: any = flatten({ ...item });
    let queryValue: any;
    return keys.every((key: string) => {
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
        else {
            return false;
        }
    })
}

const findOptions: CursorOptions = {
    $skip: 0,
    $limit: Infinity,
    $reverse: false
}

export async function find(query: Query, items: any[], options: CursorOptions): Promise<any[]> {
    return new Promise((resolve: (items: any[]) => void, reject: () => void) => {
        resolve(findSync(query, items, options));
    });
}

export function findSync(query: Query, items: any[], options: CursorOptions): any[] {
    options = { ...findOptions, ...options };
    let { $limit, $reverse, $skip } = options;
    let item: any;
    const len: number = items.length;
    const results: any[] = [];
    const keys: string[] = Object.keys(query);
    let i = $reverse === false ? 0 : (len - 1);
    if ($limit <= 0) {
        return results;
    }
    const next = () => $reverse === false ? i++ : i--;
    while (items[i] && results.length !== $limit) {
        item = items[i];
        if (match(query, item, keys)) {
            if ($skip <= results.length) {
                results.push(item);
            }
        }
        next();
    }
    return results;
}