import { workerQueuePubliser } from '@di/services.container';
import { logger } from './logger';

export const startRabbiMqProducer = async () => {
   await workerQueuePubliser.connect();
   logger.info('rabbit mq producer connected');
};

export const stopRabbitMQProducer = async () => {
   await workerQueuePubliser.disconnect();
};
