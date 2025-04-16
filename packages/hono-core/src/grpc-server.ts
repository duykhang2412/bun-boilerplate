import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import path from 'path';
import {
    getUser,
    createUser,
    updateUser,
} from './controller/user-controller';

const PROTO_PATH = path.resolve(__dirname, '../proto/user.proto');
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
});
const proto = grpc.loadPackageDefinition(packageDefinition) as any;

const server = new grpc.Server();
server.addService(proto.user.UserServiceInternal.service, {
    CreateUser: async (call: any, callback: any) => {
        try {
            const user = await createUser(call.request.data);
            callback(null, { ok: true, data: user });
        } catch (err) {
            callback(err, null);
        }
    },

    Update: async (call: any, callback: any) => {
        try {
            const ok = await updateUser(call.request.data);
            callback(null, { ok });
        } catch (err) {
            callback(err, null);
        }
    },

    GetUser: async (call: any, callback: any) => {
        try {
            const user = await getUser(call.request.userId);
            if (!user) {
                callback(null, { ok: false });
            } else {
                callback(null, { ok: true, data: user });
            }
        } catch (err) {
            callback(err, null);
        }
    },
});

export function startGrpcServer(port = 3050) {
    server.bindAsync(`0.0.0.0:${port}`, grpc.ServerCredentials.createInsecure(), () => {
        console.log(`gRPC server listening on port ${port}`);
        server.start();
    });
}
