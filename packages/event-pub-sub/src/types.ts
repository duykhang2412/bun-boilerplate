import { CloudEvent } from 'cloudevents';
import type {
  AdminConfig,
  ConsumerConfig,
  ConsumerRunConfig,
  ConsumerSubscribeTopics,
  ISerializer,
  ITopicConfig,
  KafkaConfig,
  ProducerConfig,
  ProducerRecord,
} from 'kafkajs';

export type MessageHandler<T> = (payload: T) => void;

export type CloudEventConstructor = {
  new(props: Partial<CloudEvent<unknown>>): CloudEvent<unknown>;
};

export interface EventSource {
  outgoingStreamId: string;
}

export interface StreamSubscription {
  streamId: string;
}

export type TransportType = 'KAFKA';

export interface KafkaOptions {
  client: KafkaConfig;
  admin?: AdminConfig;
  topic?: Omit<ITopicConfig, 'topic'>;
  consumer: ConsumerConfig;
  subscribe?: Omit<ConsumerSubscribeTopics, 'topics'>;
  run?: ConsumerRunConfig;
  producer?: ProducerConfig;
  send?: Omit<ProducerRecord, 'topic' | 'messages'>;
  serializer?: ISerializer<unknown>;
  deserializer?: ISerializer<unknown>;
}

export type AnyTransportOptions = KafkaOptions;

export interface Transport {
  type: TransportType;
  options: AnyTransportOptions;
}

export interface PubsubOptions {
  source: EventSource;
  subscriptions: StreamSubscription[];
  events: string[];
}

export interface ModuleRootOptions {
  enabled: boolean;
  transport: Transport;
  pubsub: PubsubOptions;
}
