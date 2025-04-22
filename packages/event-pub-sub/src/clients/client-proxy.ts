import { CloudEvent } from 'cloudevents';

import type { MessageHandler } from '../types';

export abstract class ClientProxy {
  public abstract connect(): Promise<ClientProxy>;

  public abstract close(): void;

  public abstract createTopics(topics: string[]): Promise<boolean>;

  public abstract subscribe<T>(
    topics: string[],
    handler: MessageHandler<T>,
  ): Promise<void>;

  public abstract publish(
    topic: string,
    payload: CloudEvent<unknown>,
  ): Promise<void>;

  public abstract onApplicationBootstrap(): Promise<void>;
}
