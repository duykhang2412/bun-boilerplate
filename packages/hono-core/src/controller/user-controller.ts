import fs from 'fs';
import path from 'path';
import * as yaml from 'js-yaml';
import { getCollection, setupMongoDatabase } from '@packages/mongodb-connector'
import type { BenchmarkHonoUser } from '../../models/user-entity';
import type { ConfigMongoDb } from '@packages/mongodb-connector';

const envPath = path.resolve(__dirname, '../../../../apps/env.development.yaml');
const envFile = fs.readFileSync(envPath, 'utf8');
const envConfig = yaml.load(envFile) as any;

const mongoConfig: ConfigMongoDb = envConfig.store.mongo.benchmark;

let collectionPromise: Promise<any>;

async function getUserCollection() {
    if (!collectionPromise) {
        const store = await setupMongoDatabase(mongoConfig);
        if (!store) throw new Error('Failed to connect to MongoDB');
        collectionPromise = Promise.resolve(
            getCollection<BenchmarkHonoUser>(store.database, mongoConfig.collectionName),
        );
    }
    return collectionPromise;
}

export async function getUser(userId: string) {
    const collection = await getUserCollection();
    return await collection.findOne({ userId });
}

export async function createUser(data: { userId: string; userName: string; }) {
    const now = new Date().toISOString();
    const userData: BenchmarkHonoUser = {
        userId: data.userId,
        userName: data.userName,
        createdTime: now,
        updatedTime: now,
    };
    const collection = await getUserCollection();
    await collection.insertOne(userData);
    return userData;
}

export async function updateUser(data: { userId: string; userName?: string; }) {
    const now = new Date().toISOString();
    const updateFields: any = { updatedTime: now };
    if (data.userName !== undefined) {
        updateFields.userName = data.userName;
    }

    const collection = await getUserCollection();
    const result = await collection.updateOne(
        { userId: data.userId },
        { $set: updateFields }
    );
    return result.modifiedCount > 0;
}
