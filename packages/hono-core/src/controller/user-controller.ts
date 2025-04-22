import { Hono, type Context } from 'hono';
import { ajvValidator, getAjvSchema } from '@packages/ajv-decorator';
import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import path from 'path';
import { CreateUserDto } from '../dtos/create-user.dto';
import { UpdateUserDto } from '../dtos/update-user.dto';
import { GetUserDto } from '../dtos/get-user.dto';

const PROTO_PATH = path.resolve(__dirname, '../../proto/user.proto');
const packageDef = protoLoader.loadSync(PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
});
const proto = (grpc.loadPackageDefinition(packageDef) as any).user;
const client = new proto.UserServiceInternal(
    'localhost:3050',
    grpc.credentials.createInsecure()
);

const UserController = new Hono();
UserController.post(
    '/user-controller/CreateUser',
    ajvValidator('json', getAjvSchema(CreateUserDto)),
    async (c: Context) => {
        const body = (await c.req.json()) as CreateUserDto;
        return new Promise((resolve) => {
            client.CreateUser({ data: body }, (err: any, res: any) => {
                if (err) {
                    resolve(c.json({ error: err.message }, 500));
                } else {
                    resolve(c.json(res, 201));
                }
            });
        });
    }
);

UserController.put(
    '/user-controller/UpdateUser',
    ajvValidator('json', getAjvSchema(UpdateUserDto)),
    async (c: Context) => {
        const body = (await c.req.json()) as UpdateUserDto;
        return new Promise((resolve) => {
            client.Update({ data: body }, (err: any, res: any) => {
                if (err) {
                    resolve(c.json({ error: err.message }, 500));
                } else {
                    resolve(c.json(res));
                }
            });
        });
    }
);
UserController.get(
    '/user-controller/GetUser/:userId',
    ajvValidator('param', getAjvSchema(GetUserDto)),
    async (c: Context) => {
        const userId = c.req.param('userId');
        return new Promise((resolve) => {
            client.GetUser({ userId }, (err: any, res: any) => {
                if (err) {
                    resolve(c.json({ error: err.message }, 500));
                } else {
                    resolve(c.json(res));
                }
            });
        });
    }
);

export default UserController;
