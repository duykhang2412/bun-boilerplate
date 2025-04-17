export interface RedisConfig {
    nodes: Array<{ host: string; port: number }>;
    options?: {
        redisOptions?: {
            password?: string;
        };
    };
}
