import { Hono } from 'hono';
import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import path from 'path';

const app = new Hono();

// Load proto
const PROTO_PATH = path.resolve(__dirname, '../proto/user.proto');
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
});
const proto = grpc.loadPackageDefinition(packageDefinition) as any;

// gRPC client
const client = new proto.user.UserServiceInternal(
    'localhost:3050',
    grpc.credentials.createInsecure()
);

app.get('/user/:id', async (c) => {
    return new Promise((resolve) => {
        client.GetUser({ userId: c.req.param('id') }, (err: any, response: any) => {
            if (err) {
                console.error(err);
                resolve(c.json({ error: 'Internal error' }, 500));
            } else {
                resolve(c.json(response));
            }
        });
    });
});

app.post('/user', async (c) => {
    const { userId, userName } = await c.req.json();
    return new Promise((resolve) => {
        client.CreateUser({ data: { userId, userName } }, (err: any, response: any) => {
            if (err) {
                console.error(err);
                resolve(c.json({ error: 'Internal error' }, 500));
            } else {
                resolve(c.json(response));
            }
        });
    });
});

app.put('/user', async (c) => {
    const { userId, userName } = await c.req.json();
    return new Promise((resolve) => {
        client.Update({ data: { userId, userName } }, (err: any, response: any) => {
            if (err) {
                console.error(err);
                resolve(c.json({ error: 'Internal error' }, 500));
            } else {
                resolve(c.json(response));
            }
        });
    });
});

export function startHttpServer() {
    const port = Number(process.env.HTTP_PORT) || 3000;
    Bun.serve({ fetch: app.fetch, port });
    console.log(`HTTP server listening on port ${port}`);
}
