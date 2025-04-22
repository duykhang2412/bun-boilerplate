import type { Headers } from 'cloudevents/dist/message';
import type { IHeaders } from 'kafkajs';

export default function stringifyKafkaMessageHeaders(
  raw: IHeaders = {},
): Headers {
  return Object.keys(raw).reduce(
    (headers, key) => ({
      ...headers,
      [key]: raw[key]?.toString(),
    }),
    {},
  );
}
