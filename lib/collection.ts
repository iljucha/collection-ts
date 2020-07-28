import Cursor from "./cursor";
import { Query } from "./types";

export default class Collection {
    private _data: any[] = []

    constructor(items: any[]) {
        this._data = items;
    }

    private insert(...items: any[]): void {
        this._data.push(...items);
    }

    public insertOne(item: any): void {
        this.insert(item);
    }

    public insertMany(items: any[]): void {
        this.insert(...items);
    }

    private delete(items: any[]): any[] {
        const deleted: any[] = [];
        items.map(item => {
            let index = this._data.indexOf(item);
            if (index >= 0) {
                deleted.push({ ...item });
                this._data.splice(index, 1);
            }
        })
        return deleted;
    }

    public async deleteOne(query: Query): Promise<any> {
        const results = (await this.find(query).limit(1).exec()).pointer;
        if (results.length === 0) {
            return null;
        }
        const deleted = this.delete(results);
        if (deleted.length === 0) {
            return null;
        }
        return deleted[0];
    }

    public deleteOneSync(query: Query): any {
        const results = this.find(query).limit(1).execSync().pointer;
        if (results.length === 0) {
            return null;
        }
        const deleted = this.delete(results);
        if (deleted.length === 0) {
            return null;
        }
        return deleted[0];
    }

    public async deleteMany(query: Query): Promise<any[]> {
        const results = (await this.find(query).exec()).pointer;
        if (results.length === 0) {
            return [];
        }
        const deleted = this.delete(results);
        if (deleted.length === 0) {
            return [];
        }
        return deleted;
    }

    public deleteManySync(query: Query): any[] {
        const results = this.find(query).execSync().pointer;
        if (results.length === 0) {
            return [];
        }
        const deleted = this.delete(results);
        if (deleted.length === 0) {
            return [];
        }
        return deleted;
    }

    public async updateOne(query: Query, update: any): Promise<any> {
        const results = (await this.find(query).limit(1).exec()).pointer;
        if (results.length === 0) {
            return null;
        }
        const updated = this.update(results, update);
        if (updated.length === 0) {
            return null;
        }
        return updated[0];
    }

    public updateOneSync(query: Query, update: any): any {
        const results = this.find(query).limit(1).execSync().pointer;
        if (results.length === 0) {
            return null;
        }
        const updated = this.update(results, update);
        if (updated.length === 0) {
            return null;
        }
        return updated[0];
    }

    public async updateMany(query: Query, update: any): Promise<any[]> {
        const results = (await this.find(query).exec()).pointer;
        if (results.length === 0) {
            return null;
        }
        const updated = this.update(results, update);
        if (updated.length === 0) {
            return null;
        }
        return updated;
    }

    public updateManySync(query: Query, update: any): any[] {
        const results = this.find(query).execSync().pointer;
        if (results.length === 0) {
            return null;
        }
        const updated = this.update(results, update);
        if (updated.length === 0) {
            return null;
        }
        return updated;
    }

    private update(items: any[], update: any): any[] {
        const updated: any[] = [];
        let mixin: any = {};
        items.map((item) => {
            mixin = { ...item, ...update };
            let index = this._data.indexOf(item);
            if (index >= 0) {
                updated.push({ ...item });
                this._data[index] = mixin;
            }
        })
        return updated;
    }

    public find(query?: Query): Cursor {
        return new Cursor(query || {}, this._data);
    }
}
