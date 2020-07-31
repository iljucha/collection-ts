import { find, findSync } from "./methods";
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
        this._query = query || {};
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

    /**
     * Reset your Query Object with another one
     * @param query 
     */
    public query(query: Query) {
        this._query = query || {}
        return this
    }

    /**
     * Mix your Query Object
     * @param query 
     */
    public mixQuery(query: Query) {
        this._query = { ...this._query, ...query || {} }
        return this
    }

    private async createJoins() {
        let join: any;
        let promises: Promise<any>[] = [];
        let mixes: any[] = [];
        this._joins.map((j, i) => {
            mixes[i] = []
            this._results.map((item) => mixes[i].push(item[j.where[0]]))
            promises.push(j.cursor.mixQuery({ [j.where[1]]: { $in: mixes[i] } }).toArray())
        })
        let res = await Promise.all(promises)
        this._results.map((item) => {
            join = { ...item }
            this._joins.map((j, i) => join[j.as] = { ...res[i].find((_i: any) => join[j.where[0]] === _i[j.where[1]]) })
            this._joinedResults.push(join)
        })
    }

    private createJoinsSync() {
        let join: any;
        let joins: any[] = [];
        let mixes: any[] = [];
        this._joins.map((j, i) => {
            mixes[i] = []
            this._results.map((item) => mixes[i].push(item[j.where[0]]))
            joins.push(j.cursor.mixQuery({ [j.where[1]]: { $in: mixes[i] } }).toArraySync())
        })
        this._results.map((item) => {
            join = { ...item }
            this._joins.map((j, i) => {
                join[j.as] = { ...joins[i].find((_i: any) => join[j.where[0]] === _i[j.where[1]]) }
            })
            this._joinedResults.push(join)
        })
    }

    /**
     * Executes search (asynchronous, preferred)
     */
    public async exec(): Promise<Cursor> {
        this._results = await find(this._query, this._items, this.findOptions);
        if (this._joins.length > 0) {
          await this.createJoins();
        }
        return this;
    }

    /**
     * Executes search (synchronous, use exec if possible)
     */
    public execSync(): Cursor {
        this._results = findSync(this._query, this._items, this.findOptions);
        if (this._joins.length > 0) {
          this.createJoinsSync();
        }
        return this;
    }

    /**
     * Executes search (asynchronous) and returns first item if available
     */
    public async first(): Promise<any> {
        await this.exec();
        if (this.results.length >= 0) {
            return this.results[0];
        }
        return null;
    }

    /**
     * Executes search (synchronous) and returns first item if available
     */
    public firstSync(): any {
        this.execSync();
        if (this.results.length >= 0) {
            return this.results[0];
        }
        return null;
    }

    /**
     * Executes search (asynchronous) and returns last item if available
     */
    public async last(): Promise<any> {
        await this.exec();
        if (this.results.length >= 0) {
            return this.results[this.results.length - 1];
        }
        return null;
    }

    /**
     * Executes search (synchronous) and returns last item if available
     */
    public lastSync(): any {
        this.execSync();
        if (this.results.length >= 0) {
            return this.results[this.results.length - 1];
        }
        return null;
    }

    public async count(): Promise<number> {
        await this.exec();
        return this.results.length;
    }

    public countSync(): number {
        this.execSync();
        return this.results.length;
    }

    /**
     * Executes search (asynchronous) and returns results
     */
    public async toArray(): Promise<any[]> {
        await this.exec();
        return this.results;
    }

    /**
     * Executes search (synchronous) and returns results
     */
    public toArraySync(): any[] {
        this.execSync();
        return this.results;
    }

    /**
     * Executes search (asynchronous) and returns results
     */
    public async toJSON(): Promise<string> {
        await this.exec();
        return JSON.stringify(this.results);
    }

    /**
     * Executes search (synchronous) and returns results
     */
    public toJSONSync(): string {
        this.execSync();
        return JSON.stringify(this.results);
    }

    /**
     * Executes search (asynchronous) and performs the specified action for each element in an array
     */
    public async forEach(callbackfn: (value: any, index: number, array: any[]) => void): Promise<void> {
        await this.exec();
        return this.results.forEach(callbackfn);
    }

    /**
     * Executes search (synchronous) and performs the specified action for each element in an array
     */
    public forEachSync(callbackfn: (value: any, index: number, array: any[]) => void): void {
        this.execSync();
        return this.results.forEach(callbackfn);
    }

    /**
     * Executes search (asynchronous) and calls a defined callback function on each element of an array,
     * and returns an array that contains the results.
     */
    public async map(callbackfn: (value: any, index: number, array: any[]) => void): Promise<void[]> {
        await this.exec();
        return this.results.map(callbackfn);
    }

    /**
     * Executes search (synchronous) and calls a defined callback function on each element of an array,
     * and returns an array that contains the results.
     */
    public mapSync(callbackfn: (value: any, index: number, array: any[]) => void): void[] {
        this.execSync();
        return this.results.map(callbackfn);
    }
}
