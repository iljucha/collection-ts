# Collection-TS

# Usage
## Import and create
```javascript
import { Collection } from "@iljucha/collection-ts";

let items = [
    { _id: 1, alias: "user1" },
    { _id: 2, alias: "user2" },
    { _id: 3, alias: "user3" }
];

let DB = new Collection(items);
```

## Query
```javascript
// Simple Query
let Query = { id: "2a6074a4-5775-4221-96cf-914aa8d3e7f7" };

// Nested Object Query
Query = { "user.alias": "iljucha" };

// Nested Array Query -> If environment[1] exists
Query = { "environment.1": { $exists: true } };
 
// $or-operated Query, matches all item in $or
Query = {
    $or: [
        { id: { $regexp: /findme/i } }, // regexp.test(...)
        { id: { $includes: "substring"} }, // str.includes(...)
        { id: { $eq: "onlyme" } }, // value === input
        { id: { $ne: "notme" } }, // value !== input
        { id: { $lt: 5 } }, // value > input
        { id: { $lte: 5 } }, // value >= input
        { id: { $gt: 5 } }, // value < input
        { id: { $gte: 5 } }, // value <= input
        { id: { $in: ["findme", "orme"] } }, // arr.indexOf(input) >= 0
        { id: { $nin: ["findmenot"] } }, // arr.indexOf(input) === -1
        { id: { $exists: true } }, // property exists
        { id: { $type: "string" } }, // value has type "string"
    ]
}
 
// Complex Query
Query = {
    $or: [
        { id: "2a6074a4-5775-4221-96cf-914aa8d3e7f7" },
        { "user.alias": { $regexp: /ucha/i } },
        { "user.name": { $regexp: /ucha/i } }
    ],
    $and: [
        { "user.status": { $nin: ["banned", "unauthorized"] } },
        { "user.lastDinner": { $includes: "salad" } }
    ]
}
```

## Insert
```javascript
DB.insertOne({ _id: 4, alias: "user4" });
DB.insertMany([
    { _id: 5, alias: "user5" },
    { _id: 6, alias: "user6" }
]);
```

## Update
```javascript
// update(Query, Mixin)
DB.updateOne({ _id: 4 }, { updatedAt: new Date() });
DB.updateMany({ }, { updatedAt: new Date() });

DB.updateOneSync({ _id: 4 }, { updatedAt: new Date() });
DB.updateManySync({ }, { updatedAt: new Date() });
```

## Delete
```javascript
DB.deleteOne({ _id: 4 });
DB.deleteMany({ 
    $or: [
        { _id: 1 },
        { _id: 2 }
    ]
});

DB.deleteOneSync({ _id: 4 });
DB.deleteManySync({ alias: { $eq: "user5" } });
```

## Find
```javascript
let cursor = DB.find({ alias: { $includes: "user" } }) // creates cursor
    .limit(1000) //stops looking for matches after n items
    .reverse() // searches in reversed order and returns them reversed
    .skip(100) //skips first n matches

// asynchronous methods (preferred)
async function something() {
    let results = await cursor.toArray()
    // or
    await cursor.forEach(result => console.log(result))
    // or
    await cursor.map(result => console.log(result))
    // or single result
    let first = await cursor.first()
    let last = await cursor.last()
}

// synchronous methods
function something2() {
    let results = cursor.toArraySync()
    // or
    cursor.forEachSync(result => console.log(result))
    // or
    cursor.mapSync(result => console.log(result))
    // or single result
    let first = cursor.firstSync()
    let last = cursor.lastSync()
}
```

### Joins
```javascript
let POSTS = new Collection([]);
let USERS = new Collection([]);
let USERIMAGES = new Collection([]);

const USERID = "2a6074a4-5775-4221-96cf-914aa8d3e7f7";

// Join results of USERS with the results of POSTS where key-values matches
POSTS.find({ _user: USERID })
    .join({
        cursor: USERS.find({ _id: USERID }).limit(1).join({
            cursor: USERIMAGES.find({ _user: USERID }).limit(1),
            where: ["_id", "_user"],
            as: "USERS-target-property"
        }),
        where: ["_user", "_id"],
        as: "POSTS-target-property" // optional, will be joined on "_user" if not given
    })//.toArray() or other
```

## JSON
```javascript
DB.find().toJSON()
    .then(json => console.log(json))

console.log(DB.find().toJSONSync())
```