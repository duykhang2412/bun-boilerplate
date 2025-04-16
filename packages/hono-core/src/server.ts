import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';

import { honoFactory } from './hono';

const app = honoFactory.createApp();

export const routes = app
  .get('/', (c) =>
    c.json({ error: null, message: "Hello, frontend! I'm Hono from backend!" }),
  )
  .post(
    '/hello',
    zValidator(
      'json',
      z.object({
        name: z.string(),
      }),
    ),
    (c) => {
      const { name } = c.req.valid('json');

      return c.json(
        {
          ok: true,
          message: `Hello, ${name}!`,
        },
        201,
      );
    },
  );

export { app };
