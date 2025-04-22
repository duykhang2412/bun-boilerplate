import { serve } from '@hono/node-server'
import { getLogger, getOrThrow, setupConfiguration } from '@packages/common';
import { getCollection, setupMongoDatabase } from '@packages/mongodb-connector';
import type { ConfigMongoDb, CollectionStructureConfig } from '@packages/mongodb-connector';
import { Hono } from 'hono';
import { ROUTES } from './routes/routes';
import { createRedisService } from '@packages/redis-connector/index-redis';
import { createDriver } from '@packages/neo4j';
import type { Neo4jConfig } from '@packages/neo4j';
import { ExternalEventsPubsub, type ModuleRootOptions } from '@packages/event-pub-sub';
import { setupSwagger } from '@packages/ajv-decorator';
import TestAjvDecoratorController from './api/test-ajv-decorator/test-ajv-decorator.controller';
import { generateSwaggerDocs } from './utils/swagger';

const logger = getLogger('index');

const docsSwagger = generateSwaggerDocs();

const app = new Hono();

setupSwagger(app, docsSwagger);

setupConfiguration();

// Started MongoDB
(async () => {
  const dbConfig = getOrThrow<ConfigMongoDb>("store.mongo.data_message");
  const collectionsConfig = getOrThrow<CollectionStructureConfig>("store.mongo.data_message.collections");
  const connected = await setupMongoDatabase(dbConfig, collectionsConfig);
  if (!connected) throw new Error("Fail to connect to MongoDB");
  for (const collectionName of Object.keys(collectionsConfig)) {
    const clt = getCollection(connected?.database, collectionName);
  }
})();

// Started Redis
(async () => {
  try {
    createRedisService();
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


app.route(ROUTES.controller, TestAjvDecoratorController);

const port = 3000
logger.info(`Server is running on http://localhost:${port}`);
logger.info(`Swagger UI http://localhost:${port}/ui`);
serve({
  fetch: app.fetch,
  port
})
