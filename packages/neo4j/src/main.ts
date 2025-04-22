import { getLogger } from '@packages/common';
import neo4j, { Driver } from 'neo4j-driver';

import type { Neo4jConfig } from './config';

const logger = getLogger('packages/neo4j/main');

export const createDriver = async (config: Neo4jConfig): Promise<Driver> => {
  const driver = neo4j.driver(
    'neo4j://' + config.host,
    neo4j.auth.basic(config.username, config.password),
  );

  try {
    await driver.verifyConnectivity();
    logger?.info(`Neo4j connected!`);
    return driver;
  } catch (error) {
    await driver.close();
    throw new Error(`Failed to connect to Neo4j: ${(error as Error).message}`);
  }
};
