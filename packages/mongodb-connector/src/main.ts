import { getLogger } from '@packages/common/get-logger';
import { MongoClient, type Collection, type Db, type Document } from 'mongodb';

import { processCollections, setupIndexes } from './config';
import type { CollectionConfig, ConfigMongoDb, IClientStore } from './interface';

const clientStore: IClientStore[] = [];
const logger = getLogger('mongodb-connector/main');

export async function setupMongoDatabase(
  config: ConfigMongoDb,
  indexes?: CollectionConfig | null,
): Promise<null | IClientStore> {
  const { clientUrl, dbName } = config;
  try {
    const existingClient = clientStore.find(
      (client) => client.clientUrl === clientUrl && client.dbName === dbName,
    );

    if (existingClient) {
      return existingClient;
    }

    const client = new MongoClient(clientUrl);
    await client.connect();
    const database: Db = client.db(dbName);
    logger.info(`MongoDB connected to database: ${dbName}`);

    if (indexes) {
      const collectionHandle = processCollections(indexes);
      await setupIndexes(database, collectionHandle);
    }

    const clientElement: IClientStore = {
      client,
      database,
      clientUrl,
      dbName,
    };

    clientStore.push(clientElement);
    return clientElement;
  } catch (error) {
    logger.error(
      `Failed to connect to MongoDB at ${config.clientUrl} with database ${config.dbName}`,
    );
    logger.error(error);
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
