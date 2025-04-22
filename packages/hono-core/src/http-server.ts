
import { Hono } from 'hono';
import UserController from './controller/user-controller';

const app = new Hono();

app.route('/', UserController);

export function startHttpServer() {
    const port = Number(process.env.HTTP_PORT) || 3000;
    Bun.serve({ fetch: app.fetch, port });
    console.log(`HTTP server listening on port ${port}`);
}

export { app };
