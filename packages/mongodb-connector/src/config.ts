import { Collection, type IndexSpecification } from 'mongodb';
import { getLogger } from '@packages/common';

const logger = getLogger('mongodb-connector/config');

export function processCollections(
  collectionsConfig: Record<string, { indexes: IndexSpecification[] }>,
): { collectionName: string; indexes: IndexSpecification[] }[] {
  return Object.entries(collectionsConfig).map(([collectionName, cfg]) => ({
    collectionName,
    indexes: cfg.indexes,
  }));
}

async function addMissingIndexes(
  collection: Collection,
  indexes: IndexSpecification[],
): Promise<void> {
  try {
    const existingIndexes = await collection.indexes();
    for (const idx of indexes) {
      const fields = Object.keys(idx);
      const exists = existingIndexes.some(e =>
        fields.every(f =>
          (e.key as Record<string, any>)[f] === (idx as Record<string, any>)[f]
        )
      );
      if (!exists) {
        await collection.createIndex(idx);
        logger.info(`Created index on '${collection.collectionName}':`, idx);
      }
    }
  } catch (e) {
    logger.error(`Error adding indexes for '${collection.collectionName}':`, e);
  }
}

async function removeExtraIndexes(
  collection: Collection,
  indexes: IndexSpecification[],
): Promise<void> {
  try {
    const existingIndexes = await collection.indexes();
    for (const e of existingIndexes) {
      const isExtra = !indexes.some(idx =>
        Object.keys(idx).every(k =>
          (e.key as Record<string, any>)[k] === (idx as Record<string, any>)[k]
        )
      );
      if (isExtra && e.name !== '_id_') {
        await collection.dropIndex(e.name!);
        logger.info(`Dropped extra index '${e.name}' from '${collection.collectionName}'`);
      }
    }
  } catch (e) {
    logger.error(`Error removing indexes for '${collection.collectionName}':`, e);
  }
}

export async function setupIndexes(
  database: import('mongodb').Db,
  config: { collectionName: string; indexes: IndexSpecification[] }[],
): Promise<void> {
  for (const { collectionName, indexes } of config) {
    try {
      const col = database.collection(collectionName);
      await addMissingIndexes(col, indexes);
      await removeExtraIndexes(col, indexes);
    } catch (e) {
      logger.error(`Error processing collection '${collectionName}':`, e);
    }
  }
}
