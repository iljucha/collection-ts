# Collection-TS

# Usage
## Import and create
```javascript
import Collection from "@iljucha/collectuion-ts";

let items = [
    { _id: 1, alias: "user1" },
    { _id: 2, alias: "user2" },
    { _id: 3, alias: "user3" }
];

let DB = new Collection(items);
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

## JSON
```javascript
DB.find().toJSON()
    .then(json => console.log(json))

console.log(DB.find().toJSONSync())
```