import Cursor from "./cursor";

export type Comparable = number | string | Date;
export type Item = { [property: string]: any };
export type Logic = { [Logic: string]: executableLogic };
export type executableLogic = (input1: any, input2: any) => boolean;
export type LogicGate = { [LogicGate: string]: executableLogicGate };
export type executableLogicGate = (queryOptions: QueryOption[], item: any) => boolean;
export type LogicGates = {
   $or?: QueryOption[];
   $and?: QueryOption[];
};
export type Logics = {
   $regexp?: RegExp;
   $includes?: string;
   $eq?: any;
   $ne?: any;
   $lt?: Comparable;
   $lte?: Comparable;
   $gt?: Comparable;
   $gte?: Comparable;
   $in?: any[];
   $nin?: any[];
   $exists?: boolean;
   $type?: string;
};
export type QueryOption = Item | { [property: string]: Logics };
export type Query = Item | QueryOption | LogicGates;
export type executableQuery = { [property: string]: Query };
export type CursorOptions = {
   $skip: number;
   $limit: number;
   $reverse: boolean;
};
export type Join = {
   cursor: Cursor;
   where: [string, string];
   as: string;
};
