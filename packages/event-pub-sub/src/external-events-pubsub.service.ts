import { getLogger } from '@packages/common';
import { CloudEvent } from 'cloudevents';
import { validateCloudEvent } from 'cloudevents/dist/event/spec';
import { Subject } from 'rxjs';

import { ClientKafka } from './clients/client-kafka';
import { ClientProxy } from './clients/client-proxy';
import { RuntimeException } from './runtime-exception';
import type { ModuleRootOptions } from './types';
import { formatNotificationTopic } from './utils/format-notification-topic';

export class ExternalEventsPubsub<Event extends CloudEvent<unknown>> {
  private readonly logger = getLogger(`packages/${ExternalEventsPubsub.name}`);
  private readonly client: ClientProxy;
  private subject$: Subject<CloudEvent<unknown>> | undefined;
  private $eventMappings: string[] = [];

  constructor(private readonly options: ModuleRootOptions) {
    if (!options.pubsub.subscriptions) {
      options.pubsub.subscriptions = [];
    }

    this.options = options;
    this.client = new ClientKafka(options);
    this.$eventMappings = this.options.pubsub.events;
  }

  async onModuleInit(): Promise<void> {
    if (!this.options.enabled) return;

    await this.client.connect();
    await this.createTopics();
    await this.subscribe();
    await this.client.onApplicationBootstrap();
    this.logger.info('Kafka connected');
  }

  async createTopics(): Promise<void> {
    const outgoingStreamId = this.options.pubsub.source.outgoingStreamId;

    await this.client.createTopics([
      outgoingStreamId,
      formatNotificationTopic(outgoingStreamId),
    ]);
  }

  async subscribe(): Promise<void> {
    const subscriptions = this.options.pubsub.subscriptions.map(
      (s) => s.streamId,
    );

    if (!subscriptions.length) return;

    await this.client.subscribe<Event>(subscriptions, this.onEvent.bind(this));
  }

  async publish<T extends Event>(ce: T): Promise<void> {
    const valid = validateCloudEvent(ce);

    if (!valid) {
      throw new RuntimeException('Invalid cloudevents');
    }

    const outgoingStreamId = this.options.pubsub.source.outgoingStreamId;
    const isNotificationEvent = ce.type.match(/^com\.halome\.notification\.v3/);
    const topic = isNotificationEvent
      ? formatNotificationTopic(outgoingStreamId)
      : outgoingStreamId;

    this.logger.verbose(`sending message: ${outgoingStreamId}`, { topic, ce });

    this.subject$?.next(ce);
    await this.client.publish(topic, ce);
  }

  bridgeEventsTo<T extends Event>(subject: Subject<T>): void {
    this.subject$ = subject as unknown as Subject<CloudEvent<unknown>>;
  }

  onEvent(event: Event): void {
    this.subject$?.next(event);
  }
}
