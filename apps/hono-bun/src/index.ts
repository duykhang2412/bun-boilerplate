import { serve } from '@hono/node-server';
import { getLogger } from '@packages/common/get-logger';
import { app } from '@packages/hono-core/server';

const logger = getLogger('hono-bun');

serve(
  {
    fetch: app.fetch,
    port: 3030,
  },
  (info) => {
    logger.info(`Server is running on http://localhost:${info.port}`);
  },
);
