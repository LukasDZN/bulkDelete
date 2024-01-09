import bulkDelete from './bulkDelete.util.js'

/**
 * @usage
 * Run script with command (while terminal is in the same directory as this script):
 * node --loader ts-node/esm ./dropLogs.script.ts
 */

console.log(`\n🚀 Starting ${bulkDelete.name} script...\n`)

if (!process.env.MONGO_DB_URI) {
  throw new Error(`MONGO_DB_URI is not defined!`)
}
if (!process.env.DB_NAME) {
  throw new Error(`DB_NAME is not defined!`)
}
if (!process.env.COLLECTION_NAME) {
  throw new Error(`COLLECTION_NAME is not defined!`)
}

await bulkDelete({
  mongoDbUri: process.env.MONGO_DB_URI,
  dbName: process.env.DB_NAME,
  collectionName: process.env.COLLECTION_NAME,
  deleteBeforeThisDate: new Date('2024-01-01T00:00:00.000Z'),
  documentDeleteBatchSize: 300, // Recommended & default: 300
  sleepDurationBetweenDeletesSize: 200, // Recommended & default: 200
})

console.log(`\n✅ ${bulkDelete.name} script completed!'\n`)

process.exit(0)
