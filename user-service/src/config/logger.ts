import winston from 'winston';
const { combine, errors, timestamp, colorize, json } = winston.format;

export const logger = winston.createLogger({
   level: 'silly',
   format: combine(timestamp(), json(), errors({ stack: true }), colorize({ all: true })),
   defaultMeta: { service: 'user-srv' },
   transports: [new winston.transports.Console()],
});
