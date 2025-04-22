import fs from 'fs';
import path from 'path';
import * as yaml from 'js-yaml';
import { getCollection, setupMongoDatabase } from '@packages/mongodb-connector';
import type { BenchmarkHonoUser } from '../models/user-entity';
import type { ConfigMongoDb } from '@packages/mongodb-connector';

const envPath = path.resolve(__dirname, '../../../../apps/hono-bun/env.development.yaml');
const envFile = fs.readFileSync(envPath, 'utf8');
const envConfig = yaml.load(envFile) as any;
const mongoConfig: ConfigMongoDb = envConfig.store.mongo.benchmark;

let collectionPromise: Promise<any>;

async function getUserCollection() {
    if (!collectionPromise) {
        const store = await setupMongoDatabase(mongoConfig);
        if (!store) throw new Error('Failed to connect to MongoDB');
        collectionPromise = Promise.resolve(
            getCollection<BenchmarkHonoUser>(store.database, mongoConfig.collectionName)
        );
    }
    return collectionPromise;
}

export async function getUser(userId: string) {
    const col = await getUserCollection();
    return col.findOne({ userId });
}

export async function createUser(data: { userId: string; userName: string }) {
    const now = new Date().toISOString();
    const user: BenchmarkHonoUser = {
        userId: data.userId,
        userName: data.userName,
        createdTime: now,
        updatedTime: now
    };
    const col = await getUserCollection();
    await col.insertOne(user);
    return user;
}

export async function updateUser(data: { userId: string; userName?: string }) {
    const now = new Date().toISOString();
    const update: any = { updatedTime: now };
    if (data.userName !== undefined) update.userName = data.userName;
    const col = await getUserCollection();
    const { modifiedCount } = await col.updateOne({ userId: data.userId }, { $set: update });
    return modifiedCount > 0;
}
