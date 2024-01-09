# Introduction

# Installation

```bash
npm install LukasDZN/bulkDeleteDocumentsFromDbBeforeDate
```

# Usage

To run script, use this command in the terminal (while the terminal is running in the same directory as this script):
```bash
node ./dropLogs.script.js
```

```js
import bulkDeleteDocumentsFromDbBeforeDate from ''

const main = async () => {
  console.log(
    `\n🚀 Starting ${bulkDeleteDocumentsFromDbBeforeDate.name} script...\n`
  )

  await bulkDeleteDocumentsFromDbBeforeDate({
    mongoDbUri:
      'mongodb+srv://<your_db_uri@usa.abcdef.mongodb.net?retryWrites=true&w=majority',
    dbName: '<your_db_name>',
    collectionName: '<your_collection_name>',
    deleteBeforeThisDate: new Date('2024-01-01T00:00:00.000Z'),
    documentDeleteBatchSize: 300, // Recommended & default: 300
    sleepDurationBetweenDeletesSize: 200, // Recommended & default: 200
  })

  console.log(
    `\n✅ ${bulkDeleteDocumentsFromDbBeforeDate.name} script completed!'\n`
  )

  process.exit(0)
}

main()
```