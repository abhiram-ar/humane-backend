import winston from 'winston';
import { formatDate } from 'date-fns';
const { combine, errors, timestamp, colorize, printf } = winston.format;

export const logger = winston.createLogger({
   level: 'silly',
   format: combine(
      timestamp({
         format: () => formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss'),
      }),
      printf(({ timestamp, level, message }) => {
         return `[${timestamp}] ${level.toUpperCase().padEnd(5, ' ')}: ${message}`;
      }),
      errors({ stack: true }),
      colorize({ all: true })
   ),
   // defaultMeta: { service: 'writer-service' },
   transports: [new winston.transports.Console()],
});
