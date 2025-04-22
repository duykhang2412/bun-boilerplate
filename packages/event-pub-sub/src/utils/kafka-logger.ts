import { getLogger } from '@packages/common';
import { logLevel } from 'kafkajs';
const toWinstonLogLevel = (level: logLevel): string => {
  switch (level) {
    case logLevel.ERROR:
    case logLevel.NOTHING:
      return 'error';
    case logLevel.WARN:
      return 'warn';
    case logLevel.INFO:
      return 'info';
    case logLevel.DEBUG:
      return 'debug';
    default:
      return 'error';
  }
};

export const WinstonLogCreator = () => {
  const logger = getLogger('Kafka');

  return ({ level, log }: { level: logLevel; log: { message: string;[key: string]: any } }) => {
    const { message, ...extra } = log;
    logger.log({
      level: toWinstonLogLevel(level),
      message,
      extra,
    });
  };
};
