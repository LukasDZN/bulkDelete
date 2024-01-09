declare const bulkDelete: ({ mongoDbUri, dbName, collectionName, deleteBeforeThisDate, documentDeleteBatchSize, sleepDurationBetweenDeletesSize, }: {
    mongoDbUri: string;
    dbName: string;
    collectionName: string;
    deleteBeforeThisDate: Date;
    documentDeleteBatchSize?: number | undefined;
    sleepDurationBetweenDeletesSize?: number | undefined;
}) => Promise<void>;
export default bulkDelete;
