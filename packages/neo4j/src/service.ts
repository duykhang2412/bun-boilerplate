import { getLogger, getOrThrow, setupConfiguration } from '@packages/common';
import neo4j, { Driver, Result, Session, Transaction } from 'neo4j-driver';

import type { Neo4jConfig } from './config';

const logger = getLogger('packages/neo4j/service');

setupConfiguration();

const neo4jService = getOrThrow<Neo4jConfig>('store.neo4j');

export function createReadSession(
  driver: Driver,
  database?: string,
): Session | Error {
  try {
    return driver.session({
      database: database || neo4jService.database,
      defaultAccessMode: neo4j.session.READ,
    });
  } catch (e) {
    logger.error((e as Error).message);
    return e as Error;
  }
}

export function createWriteSession(
  driver: Driver,
  database?: string,
): Session | Error {
  try {
    return driver.session({
      database: database || neo4jService.database,
      defaultAccessMode: neo4j.session.WRITE,
    });
  } catch (e) {
    logger.error((e as Error).message);
    return e as Error;
  }
}

export function isWriteCypherQuery(cypher: string): boolean | Error {
  try {
    const normalizedCypher = cypher.trim().toUpperCase();
    return (
      normalizedCypher.includes('CREATE') ||
      normalizedCypher.includes('MERGE') ||
      normalizedCypher.includes('SET') ||
      normalizedCypher.includes('DELETE') ||
      normalizedCypher.includes('REMOVE')
    );
  } catch (e) {
    logger.error((e as Error).message);
    return e as Error;
  }
}

export function beginTransaction(
  driver: Driver,
  database?: string,
): Transaction | Error {
  const session = createWriteSession(driver, database);
  return session instanceof Error ? session : session.beginTransaction();
}

export function executeCypher(
  driver: Driver,
  cypher: string,
  params?: Record<string, unknown>,
  databaseOrTransaction?: string | Transaction,
): Result | Error {
  try {
    if (databaseOrTransaction instanceof Transaction) {
      return databaseOrTransaction.run(cypher, params);
    }

    const isWriteQuery = isWriteCypherQuery(cypher);
    if (isWriteQuery instanceof Error) {
      return isWriteQuery;
    }

    const session = isWriteQuery
      ? createWriteSession(driver, databaseOrTransaction as string)
      : createReadSession(driver, databaseOrTransaction as string);

    return session instanceof Error ? session : session.run(cypher, params);
  } catch (e) {
    logger.error((e as Error).message);
    return e as Error;
  }
}

export async function onApplicationBootstrap(
  driver: Driver,
  database: string,
): Promise<void> {
  executeCypher(driver, `CREATE DATABASE ${database}`);
}

export function onApplicationShutdown(driver: Driver): Promise<void> {
  return driver.close();
}
