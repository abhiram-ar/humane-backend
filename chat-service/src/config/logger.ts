import winston from 'winston';
import { ENV } from './env';
const { combine, errors, timestamp, json } = winston.format;

// dev: logger
// export const logger = winston.createLogger({
//    level: 'silly',
//    format: combine(
//       timestamp({
//          format: () => formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss'),
//       }),
//       printf(({ timestamp, level, message }) => {
//          return `[${timestamp}] ${level.toUpperCase().padEnd(5, ' ')}: ${message}`;
//       }),
//       errors({ stack: true }),
//       colorize({ all: true })
//    ),
//    // defaultMeta: { service: 'elasticsearch-proxy' },
//    transports: [new winston.transports.Console()],
// });

export const logger = winston.createLogger({
   level: ENV.NODE_ENV === 'production' ? 'info' : 'silly',
   format: combine(timestamp(), json(), errors({ stack: true })),
   defaultMeta: { service: 'chat-srv' },
   transports: [new winston.transports.Console()],
});
