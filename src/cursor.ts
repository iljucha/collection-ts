import { find, findSync } from "./methods";
import "./index";
import { Query, CursorOptions, Join } from "./types";

export default class Cursor {
    private _items: any[] = [];
    private _results: any[] = [];
    private _joins: Join[] = [];
    private _joinedResults: any[] = [];
    private _query: Query = {};
    private _skip: number = 0;
    private _limit: number = Infinity;
    private _reverse: boolean = false;

    /**
     * Creates a new Cursor object
     * @param query Query Object
     * @param items Object Array
     */
    constructor(query: Query, items: any[]) {
        this._query = query;
        this._items = items;
    }

    /**
     * CursorOption-object\
     * Part of find/findSync arguments.
     */
    private get findOptions(): CursorOptions {
        return {
            $limit: this._limit,
            $reverse: this._reverse,
            $skip: this._skip
        }
    }

    /**
     * Collection of Settings
     */
    public get settings() {
        return {
            skip: this.skip,
            limit: this.limit,
            reverse: this.reverse,
            join: this.join
        }
    }


    /**
     * Collection of async operators
     */
    public get async() {
        return {
            exec: this.exec,
            count: this.count,
            first: this.first,
            last: this.last,
            toArray: this.toArray,
            toJSON: this.toJSON,
            map: this.map,
            forEach: this.forEach
        }
    }

    /**
     * Collection of synchronous operators
     */
    public get sync() {
        return {
            exec: this.execSync,
            count: this.countSync,
            first: this.firstSync,
            last: this.firstSync,
            toArray: this.toArraySync,
            toJSON: this.toJSONSync,
            map: this.mapSync,
            forEach: this.forEachSync
        }
    }

    /**
     * Copy of found results
     */
    public get results(): any[] {
        let tmp = [];
        if (this._joinedResults.length > 0) {
            tmp = this._joinedResults;
        }
        else {
            tmp = [ ...this._results ];
        }
        return tmp;
    }

    /**
     * Original addresses of results
     */
    public get pointer() {
        return this._results;
    }

    /**
     * Sets an offset for e. g. paginating
     * @param amount Amount of skipped items
     */
    public skip(amount: number): Cursor{
        this._skip = amount;
        return this;
    }

    /**
     * Stop looking for items after given input
     * @param amount Item limiter
     */
    public limit(amount: number): Cursor {
        this._limit = amount;
        return this
    }

    /**
     * Looks for items in reversed order and also returns them reversed
     */
    public reverse(): Cursor {
        this._reverse = true;
        return this;
    }

    /**
     * Join the results of other collections
     * @param join 
     */
    public join(join: Join): Cursor {
        this._joins.push(join);
        return this;
    }

    private async createJoins() {
        this._joinedResults = [];
        let found: any;
        let joined: any;
        let joining: any;
        let promises: any[] = [];
        this._joins.map(link => promises.push(link.cursor.async.toArray()));
        let res = await Promise.all(promises);
        this.results.map(item => {
            joining = { ...item };
            joined = 0;
            this._joins.map((link, counter) => {
                found = res[counter].find((_item: any) => item[link.where[0]] === _item[link.where[1]]);
                if (found) {
                    joining[link.as || link.where[0]] = found;
                    joined++;
                }
            })
            if (this._joins.length === joined) {
                this._joinedResults.push(joining);
            }
        })
    }

    private createJoinsSync() {
        this._joinedResults = [];
        let found: any;
        let joined: any;
        let joining: any;
        let joins: any[] = [];
        this._joins.map(join => joins.push(join.cursor.sync.toArray()));
        this.results.map(item => {
            joining = { ...item };
            joined = 0;
            this._joins.map((join, counter) => {
                found = joins[counter].find((_item: any) => item[join.where[0]] === _item[join.where[1]]);
                if (found) {
                    joining[join.as || join.where[0]] = found;
                    joined++;
                }
            })
            if (this._joins.length === joined) {
                this._joinedResults.push(joining);
            }
        })
    }
 
    /**
     * Executes search (asynchronous, preferred)
     */
    public async exec(): Promise<Cursor> {
        this._results = await find(this._query, this._items, this.findOptions);
        await this.createJoins();
        return this;
    }

    /**
     * Executes search (synchronous, use exec if possible)
     */
    public execSync(): Cursor {
        this._results = findSync(this._query, this._items, this.findOptions);
        this.createJoinsSync();
        return this;
    }

    /**
     * Executes search (asynchronous) and returns first item if available
     */
    public async first(): Promise<any> {
        await this.async.exec();
        if (this.results.length >= 0) {
            return this.results[0];
        }
        return null;
    }

    /**
     * Executes search (synchronous) and returns first item if available
     */
    public firstSync(): any {
        this.sync.exec();
        if (this.results.length >= 0) {
            return this.results[0];
        }
        return null;
    }

    /**
     * Executes search (asynchronous) and returns last item if available
     */
    public async last(): Promise<any> {
        await this.async.exec();
        if (this.results.length >= 0) {
            return this.results[this.results.length - 1];
        }
        return null;
    }

    /**
     * Executes search (synchronous) and returns last item if available
     */
    public lastSync(): any {
        this.sync.exec();
        if (this.results.length >= 0) {
            return this.results[this.results.length - 1];
        }
        return null;
    }

    public async count(): Promise<number> {
        await this.async.exec();
        return this.results.length;
    }

    public countSync(): number {
        this.sync.exec();
        return this.results.length;
    }

    /**
     * Executes search (asynchronous) and returns results
     */
    public async toArray(): Promise<any[]> {
        await this.async.exec();
        return this.results;
    }

    /**
     * Executes search (synchronous) and returns results
     */
    public toArraySync(): any[] {
        return this.sync.exec().results;
    }

    /**
     * Executes search (asynchronous) and returns results
     */
    public async toJSON(): Promise<string> {
        await this.async.exec();
        return JSON.stringify(this.results);
    }

    /**
     * Executes search (synchronous) and returns results
     */
    public toJSONSync(): string {
        this.sync.exec();
        return JSON.stringify(this.results);
    }

    /**
     * Executes search (asynchronous) and performs the specified action for each element in an array
     */
    public async forEach(callbackfn: (value: any, index: number, array: any[]) => void): Promise<void> {
        await this.async.exec();
        return this.results.forEach(callbackfn);
    }

    /**
     * Executes search (synchronous) and performs the specified action for each element in an array
     */
    public forEachSync(callbackfn: (value: any, index: number, array: any[]) => void): void {
        this.sync.exec();
        return this.results.forEach(callbackfn);
    }

    /**
     * Executes search (asynchronous) and calls a defined callback function on each element of an array,
     * and returns an array that contains the results.
     */
    public async map(callbackfn: (value: any, index: number, array: any[]) => void): Promise<void[]> {
        await this.async.exec();
        return this.results.map(callbackfn);
    }

    /**
     * Executes search (synchronous) and calls a defined callback function on each element of an array,
     * and returns an array that contains the results.
     */
    public mapSync(callbackfn: (value: any, index: number, array: any[]) => void): void[] {
        this.sync.exec();
        return this.results.map(callbackfn);
    }
}