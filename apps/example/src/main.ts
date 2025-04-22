import { serve } from 'bun';
import { getLogger, getOrThrow, setupConfiguration } from '@packages/common';
import { getCollection, setupMongoDatabase } from '@packages/mongodb-connector';
import type { CollectionStructureConfig, ConfigMongoDb } from '@packages/mongodb-connector';
import { Hono } from 'hono';
import { ExternalEventsPubsub } from '@packages/event-pub-sub';
import type { ModuleRootOptions } from '@packages/event-pub-sub'
import { createDriver, type Neo4jConfig } from '@packages/neo4j';
const logger = getLogger('index');
const app = new Hono();

setupConfiguration();
(async () => {
  try {
    const dbConfig = getOrThrow<ConfigMongoDb>("store.mongo.data_message");
    const collectionsConfig = getOrThrow<CollectionStructureConfig>("store.mongo.data_message.collections");
    const connected = await setupMongoDatabase(dbConfig, collectionsConfig);
    if (!connected) throw new Error("Fail to connect to MongoDB");
    for (const collectionName of Object.keys(collectionsConfig)) {
      const clt = getCollection(connected?.database, collectionName);
    }
  } catch (error) {
    logger.error(error);
  }
})();
// Started Kafka
(async () => {
  try {
    const EVENT_PUB_SUB_CONFIG = getOrThrow<ModuleRootOptions>('kafka');
    const eventBus = new ExternalEventsPubsub<any>(EVENT_PUB_SUB_CONFIG);
    await eventBus.onModuleInit();
  } catch (error) {
    logger.error(error);
  }
})();
// Started Neo4j
(async () => {
  try {
    const config: Neo4jConfig = getOrThrow('store.neo4j');
    createDriver(config);
  } catch (error) {
    logger.error(error);
  }
})();

// Khởi động server HTTP
const port = 3000;
logger.info(`Server is running on http://localhost:${port}`);
// logger.info(`Swagger UI http://localhost:${port}/ui`);
Bun.serve({
  fetch: app.fetch,
  port,
});