import Redis from "ioredis";
import type { Cluster, ClusterNode, ClusterOptions } from "ioredis";
import { getLogger } from "@packages/common";
import { setupConfiguration, getOrThrow } from "@packages/common";

type RedisConfig = {
    nodes: ClusterNode[];
    options?: ClusterOptions;
};

const logger = getLogger("packages/redis-connector/index");

setupConfiguration();

let cluster: Cluster | null = null;

export function createRedisService() {
    const redisConfig = getOrThrow<RedisConfig>('redis');
    if (cluster === null) {
        cluster = new Redis.Cluster(redisConfig.nodes, redisConfig.options);
        logger.info("Redis initialized")
    } else {
        logger.error("Cluster has been initialized")
    }
}

export function redisCluster(): Cluster {
    if (cluster === null) {
        throw new Error('RedisCluster is not initialized');
    }
    return cluster;
}