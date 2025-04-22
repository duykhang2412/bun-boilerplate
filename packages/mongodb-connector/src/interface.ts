import { Db, MongoClient } from 'mongodb';

export interface IndexSpecification {
  [key: string]: number;
}

export interface CollectionStructureConfig {
  [collectionName: string]: {
    indexes: IndexSpecification[];
  };
}

export interface CollectionConfig {
  collections: CollectionStructureConfig;
}

export interface IClientStore {
  client: MongoClient;
  database: Db;
  clientUrl: string;
  dbName: string;
}

export interface ConfigMongoDb {
  clientUrl: string;
  dbName: string;
  collectionName: string;
}