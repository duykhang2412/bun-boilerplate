import * as winston from 'winston';

export function getLogger(serviceName: string) {
  return winston.createLogger({
    level: 'silly',
    transports: [
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
          winston.format.printf(({ timestamp, level, message, ...data }) => {
            const splat = data[Symbol.for('splat')] as unknown as any[];
            if (!splat || splat[0] === 'ConfigService') {
              return `${timestamp} [${serviceName}] ${level}: ${message}`;
            }

            const meta = Object.entries(splat)
              .map(([_, value]) =>
                typeof value === 'object'
                  ? `\n${JSON.stringify(value, null, 2)}`
                  : value,
              )
              .join(' ');

            return `${timestamp} [${serviceName}] ${level}: ${message} ${meta}`;
          }),
        ),
      }),
    ],
  });
}
