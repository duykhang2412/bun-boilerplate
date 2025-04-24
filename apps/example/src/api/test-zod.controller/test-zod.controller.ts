import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { CreateUserDto, UpdateUserDto, UserDto } from '../../dtos/test-zod.dto';

const TestZodValidator = new Hono();

TestZodValidator.post(
    '/',
    zValidator('json', CreateUserDto),
    (c) => {
        const payload = c.req.valid('json') as CreateUserDto;
        return c.json({ success: true, data: payload }, 201);
    }
);

TestZodValidator.get(
    '/:id',
    zValidator('param', z.object({ id: z.string().uuid() })),
    (c) => {
        const { id } = c.req.valid('param') as { id: string };
        const user = { id, name: 'Sample', email: 'sample@example.com', age: 30 } as UserDto;
        return c.json({ success: true, data: user });
    }
);

TestZodValidator.put(
    '/users/:id',
    zValidator('param', z.object({ id: z.string().uuid() })),
    zValidator('json', UpdateUserDto),
    (c) => {
        const { id } = c.req.valid('param') as { id: string };
        const payload = c.req.valid('json') as UpdateUserDto;
        const updated = { id, ...payload } as UserDto;
        return c.json({ success: true, data: updated });
    }
);
TestZodValidator.delete(
    '/users/:id',
    zValidator('param', z.object({ id: z.string().uuid() })),
    (c) => {
        const { id } = c.req.valid('param') as { id: string };
        return c.json({ success: true });
    }
);

export default TestZodValidator;
