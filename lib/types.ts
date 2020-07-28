type Comparable = number | string | Date;
type Item = { [property: string]: any };
type Logic = (input1: any, input2: any) => boolean;
type LogicGate = (queryOptions: QueryOption[], item: any) => boolean;
type LogicGates = {
   $or?: QueryOption[];
   $and?: QueryOption[];
};
type Logics = {
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
type QueryOption = Item | { [property: string]: Logics }; 
type Query = Item | QueryOption | LogicGates;
type CursorOptions = {
   $skip?: number;
   $limit?: number;
   $reverse?: boolean;
};

export {
   Comparable,
   Item,
   Logic,
   LogicGate,
   LogicGates,
   Logics,
   QueryOption,
   Query,
   CursorOptions
}