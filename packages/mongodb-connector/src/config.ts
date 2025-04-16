import { getLogger } from '@packages/common/get-logger';
import { Collection, Db, type IndexSpecification } from 'mongodb';

const logger = getLogger('packages/mongodb-connector/config');

function processCollections(
  collections: Record<string, any>,
): { collectionName: string; indexes: IndexSpecification[] }[] {
  return Object.entries(collections).map(([collectionName, fields]) => ({
    collectionName,
    indexes: fields || [],
  }));
}

async function addMissingIndexes(collection: Collection,
  indexes: IndexSpecification[],
): Promise<void> {
  try {
    const existingIndexes = await collection.indexes();

    for (const index of indexes) {
      const indexFields = Object.keys(index);
      const exists = existingIndexes.some((existingIndex) =>
        indexFields.every(
          (field) =>
            (existingIndex.key as Record<string, any>)[field] &&
            (existingIndex.key as Record<string, any>)[field] === (index as Record<string, any>)[field],
        ),
      );

      if (!exists) {
        await collection.createIndex(index);
        logger.info(`Created index on '${collection.collectionName}':`, index);
      }
    }
  } catch (error) {
    logger.error(
      `Error adding missing indexes for '${collection.collectionName}':`,
      error,
    );
  }
}

async function removeExtraIndexes(
  collection: Collection,
  indexes: IndexSpecification[],
): Promise<void> {
  try {
    const existingIndexes = await collection.indexes();

    for (const existingIndex of existingIndexes) {
      const isExtraIndex = !indexes.some((index) =>
        Object.keys(index).every(
          (key) =>
            (existingIndex.key as Record<string, any>)[key] !== undefined &&
            (existingIndex.key as Record<string, any>)[key] === (index as Record<string, any>)[key],
        ),
      );

      if (isExtraIndex && existingIndex.name !== '_id_') {
        await collection.dropIndex(existingIndex.name || '');
        logger.info(
          `Dropped extra index from '${collection.collectionName}':`,
          existingIndex.name,
        );
      }
    }
  } catch (error) {
    logger.error(
      `Error removing extra indexes for '${collection.collectionName}':`,
      error,
    );
  }
}

async function setupIndexes(
  database: Db,
  config: { collectionName: string; indexes: IndexSpecification[] }[],
): Promise<void> {
  for (const { collectionName, indexes } of config) {
    try {
      const collection = database.collection(collectionName);
      await addMissingIndexes(collection, indexes);
      await removeExtraIndexes(collection, indexes);
    } catch (error) {
      logger.error(`Error processing collection '${collectionName}':`, error);
    }
  }
}

export { processCollections, setupIndexes };
