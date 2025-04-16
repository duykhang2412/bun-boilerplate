import { startGrpcServer } from '@packages/hono-core/grpc-server';
import { startHttpServer } from '@packages/hono-core/http-server';

startGrpcServer();
startHttpServer();
