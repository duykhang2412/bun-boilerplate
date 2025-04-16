import { createFactory } from 'hono/factory';

type HonoConfig = {
  Bindings: {
    PASSWORD_SALT: string;
  };
  Variables: object;
};

const honoFactory = createFactory<HonoConfig>({
  initApp: () => { },
});

export { honoFactory };
