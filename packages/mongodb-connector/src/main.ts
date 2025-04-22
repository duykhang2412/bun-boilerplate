import { getLogger } from '@packages/common';
import { Collection, Db, MongoClient } from 'mongodb';
import type { Document } from 'mongodb';
import { processCollections, setupIndexes } from './config';
import type { ConfigMongoDb, IClientStore, IndexSpecification } from './interface';

const clientStore: IClientStore[] = [];
const logger = getLogger('mongodb-connector/main');

export async function setupMongoDatabase(
  config: ConfigMongoDb,
  collectionsConfig?: Record<string, { indexes: IndexSpecification[] }>,
): Promise<null | IClientStore> {
  const { clientUrl, dbName } = config;

  try {
    const existing = clientStore.find(c => c.clientUrl === clientUrl && c.dbName === dbName);
    if (existing) return existing;
    const client = new MongoClient(clientUrl);
    await client.connect();
    const db: Db = client.db(dbName);
    logger.info(`MongoDB connected to database: ${dbName}`);

    if (collectionsConfig) {
      try {
        const arr = processCollections(collectionsConfig);
        await setupIndexes(db, arr);
      } catch (e) {
        logger.error(`Failed to setup indexes for ${dbName}:`, (e as Error).message);
      }
    }

    const store = { client, database: db, clientUrl, dbName };
    clientStore.push(store);
    return store;
  } catch (err) {
    logger.error(`Cannot connect to MongoDB at ${clientUrl} (${dbName}):`, (err as Error).message);
    return null;
  }
}

export function getCollection<TSchema extends Document>(
  database: Db | undefined,
  collectionName: string,
): Collection<TSchema> {
  if (!database) {
    throw new Error(`MongoDB database instance doesn't exist`);
  }
  database
    .listCollections({ name: collectionName })
    .toArray()
    .then((collections) => {

      if (collections.length === 0) {
        database
          .createCollection(collectionName)
          .then(() => {
            console.log(`Collection ${collectionName} created`);
          })
          .catch((err) => {
            console.error(`Failed to create collection: ${err}`);
          });
      }
    })
    .catch((err) => {
      console.error(`Failed to list collections: ${err}`);
    });

  return database.collection<TSchema>(collectionName);
}
