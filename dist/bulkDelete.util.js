import cliProgress from 'cli-progress';
import mongoose from 'mongoose';
import ora from 'ora';
import prompt from 'prompt-sync';
/**
 * This script deletes documents from the database by document insertion date (_id), in batches.
 *
 * @description
 * This script uses MongoDB driver directly so that this script can be re-used for any project
 * as you're able to select collection names dynamically, without models.
 *
 * @remarks
 * About performance:
 * - 1 mil docs in 5 minutes -> maxes out CPU (M10 cluster)
 * - 1 mil docs in 10 minutes -> may be okay (1.6k per second)
 *
 * Build to JS with command:
 * yarn build
 *
 * @usage
 * Run script with command (while terminal is in the same directory as this script):
 * node --loader ts-node/esm ./dropLogs.script.ts
 */
const validateDate = (date) => {
    if (date.getTime() > Date.now()) {
        throw new Error(`You cannot delete documents that were created in the future!`);
    }
    // Check if date is valid
    if (isNaN(date.getTime())) {
        throw new Error(`Invalid date: ${date}`);
    }
};
const connectToMongoDb = async ({ mongoDbUri, dbName, }) => {
    try {
        if (!mongoDbUri) {
            throw new Error(`MONGO_DB_URI is not defined!`);
        }
        await mongoose.connect(mongoDbUri, {
            dbName,
        });
        console.log(' Connected to MongoDb \x1b[32msuccessfully\x1b[0m!');
    }
    catch (error) {
        console.error('Error connecting to MongoDB:', error);
    }
};
const dateToObjectId = (date) => {
    return new mongoose.Types.ObjectId(Math.floor(date.getTime() / 1000).toString(16) + '0000000000000000');
};
const checkIfCollectionExists = async ({ collection, collectionName, }) => {
    const collectionExists = await collection.find({}).limit(1).hasNext();
    if (!collectionExists) {
        throw new Error(`Collection '${collectionName}' does not exist or has 0 documents!`);
    }
};
const sleep = (ms) => {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
};
// Helper function to format duration
const formatDuration = (milliseconds) => {
    let seconds = Math.floor(milliseconds / 1000);
    let minutes = Math.floor(seconds / 60);
    let hours = Math.floor(minutes / 60);
    seconds = seconds % 60;
    minutes = minutes % 60;
    hours = hours % 60;
    if (hours === 0) {
        return `${minutes}m ${seconds}s`;
    }
    return `${hours}h ${minutes}m ${seconds}s`;
};
// Helper function to estimate time remaining
const formatEta = (startTime, completed, total) => {
    const elapsedTime = Date.now() - startTime;
    const estimatedTotalTime = (elapsedTime * total) / completed;
    const estimatedRemainingTime = estimatedTotalTime - elapsedTime;
    return formatDuration(estimatedRemainingTime);
};
const bulkDelete = async ({ mongoDbUri, dbName, collectionName, deleteBeforeThisDate, documentDeleteBatchSize = 300, sleepDurationBetweenDeletesSize = 200, }) => {
    if (!mongoDbUri) {
        throw new Error(`mongoDbUri is not defined!`);
    }
    if (!dbName) {
        throw new Error(`dnName is not defined!`);
    }
    if (!collectionName) {
        throw new Error(`collectionName is not defined!`);
    }
    validateDate(deleteBeforeThisDate);
    if (documentDeleteBatchSize <= 0) {
        throw new Error(`documentDeleteBatchSize must be greater than 0! (documentDeleteBatchSize: ${documentDeleteBatchSize})`);
    }
    if (sleepDurationBetweenDeletesSize <= 0) {
        throw new Error(`sleepDurationBetweenDeletesSize must be greater than 0! (sleepDurationBetweenDeletesSize: ${sleepDurationBetweenDeletesSize})`);
    }
    const spinner = ora({
        text: 'Connecting to MongoDB...',
        color: 'yellow',
    }).start();
    await connectToMongoDb({
        mongoDbUri,
        dbName,
    });
    const collection = mongoose.connection.db.collection(collectionName);
    spinner.text = 'Validating that collection exists...';
    await checkIfCollectionExists({ collection, collectionName });
    spinner.text = 'Getting document counts...';
    let deletedDocumentCount = 0;
    const deleteBeforeThisObjectId = dateToObjectId(deleteBeforeThisDate);
    const startTime = Date.now(); // Record start time
    // Get and display document counts to warn user
    const totalCollectionDocumentCount = await collection.estimatedDocumentCount();
    const toBeDeletedDocumentCount = await collection.countDocuments({
        _id: { $lt: deleteBeforeThisObjectId },
    });
    const toBeRemainingDocumentCount = totalCollectionDocumentCount - toBeDeletedDocumentCount;
    spinner.stop();
    console.log(`
- Total collection document count: ${totalCollectionDocumentCount.toLocaleString()}
- To be deleted document count:    ${toBeDeletedDocumentCount.toLocaleString()}
- To be remaining document count:  ${toBeRemainingDocumentCount < 0
        ? 0
        : toBeRemainingDocumentCount.toLocaleString()}
`);
    // Prompt user to confirm deletion
    const dateString = deleteBeforeThisDate.toISOString().split('T');
    const formattedDateString = dateString[0] + ' ' + dateString[1].split('.')[0];
    const promptMessage = `⚠️   Are you sure you want to delete ${toBeDeletedDocumentCount.toLocaleString()} documents created before ` +
        formattedDateString +
        ` from '${collectionName}' collection? (y/n) `;
    console.log(promptMessage);
    const userInput = prompt()('');
    if (userInput !== 'y') {
        console.log('\nAborting...');
        return;
    }
    console.log('\n');
    const progressBar = new cliProgress.SingleBar({
        format: 'Progress | {bar} | {percentage}% | {value}/{total} Documents | Elapsed: {duration_formatted} | Time remaining: {eta_formatted}',
    }, cliProgress.Presets.shades_classic);
    // start the progress bar with a total value of 200 and start value of 0
    progressBar.start(toBeDeletedDocumentCount, 0);
    do {
        const documentsToDelete = await collection
            .find({ _id: { $lt: deleteBeforeThisObjectId } }, { projection: { _id: 1 } })
            .limit(documentDeleteBatchSize)
            .toArray();
        const objectIdsToDelete = documentsToDelete.map((document) => {
            return document._id;
        });
        const deleteResult = await collection.deleteMany({
            _id: { $in: objectIdsToDelete },
        });
        // DevTool: simulate deletion:
        // const deleteResult = {
        //   deletedCount: objectIdsToDelete.length,
        // }
        deletedDocumentCount += deleteResult.deletedCount;
        progressBar.update(deletedDocumentCount, {
            duration_formatted: formatDuration(Date.now() - startTime),
            eta_formatted: formatEta(startTime, deletedDocumentCount, toBeDeletedDocumentCount),
        });
        // Sleep for the specified duration to limit the rate
        await sleep(sleepDurationBetweenDeletesSize);
    } while (deletedDocumentCount < toBeDeletedDocumentCount);
    progressBar.stop();
};
export default bulkDelete;
//# sourceMappingURL=bulkDelete.util.js.map