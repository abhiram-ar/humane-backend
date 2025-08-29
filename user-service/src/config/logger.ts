import winston from 'winston';
import { ENV } from './env';
const { combine, errors, timestamp, json } = winston.format;

export const logger = winston.createLogger({
   level: ENV.NODE_ENV === 'production' ? 'info' : 'silly',
   format: combine(timestamp(), errors({ stack: true }), json()),
   defaultMeta: { service: 'user-srv' },
   transports: [new winston.transports.Console()],
});
