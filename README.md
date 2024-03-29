# LukasDZN/bulkDelete

This Node.js module provides a script for bulk deleting documents from a MongoDB database based on a specified date. It's built to handle large batches efficiently and safely, ensuring that only documents created before a given date are deleted.

## Introduction

`bulkDelete` is a script designed for MongoDB databases. It allows users to delete documents from a specified collection that were created before a certain date. This script is particularly useful for managing logs and old data in a database.

## Installation

```bash
npm install LukasDZN/bulkDelete
```

or

```bash
yarn add LukasDZN/bulkDelete
```

## Usage

First, create a `bulkDelete.script.js` or `bulkDelete.script.ts` file, and copy-paste this code:

```js
import bulkDelete from 'LukasDZN/bulkDelete'

const main = async () => {
  console.log(
    `\n🚀 Starting ${bulkDelete.name} script...\n`
  )

  await bulkDelete({
    mongoDbUri:
      'mongodb+srv://<your_db_uri@usa.abcdef.mongodb.net?retryWrites=true&w=majority',
    dbName: '<your_db_name>',
    collectionName: '<your_collection_name>',
    deleteBeforeThisDate: new Date('2024-01-01T00:00:00.000Z'),
    documentDeleteBatchSize: 300, // Recommended & default: 300
    sleepDurationBetweenDeletesSize: 200, // Recommended & default: 200
  })

  console.log(
    `\n✅ ${bulkDelete.name} script completed!'\n`
  )

  process.exit(0)
}

main()
```

Then, run the script by using this command in the terminal (while the terminal is running in the same directory as this script):

```bash
node ./bulkDelete.script.js
```

or 

```bash
node --loader ts-node/esm ./bulkDelete.script.ts
```
