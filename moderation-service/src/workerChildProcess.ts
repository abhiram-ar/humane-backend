import { nsfwImageClassifierService, postMediaModerationWorker } from '@di/services.container';
import { logger } from './config/logger';
import path from 'path';
import { connectKafkaProducer, disconnectKafkaProducer } from '@config/kafka';
import checkEnv from '@config/env';
export const startRabbitMqWorkers = async () => {
   await postMediaModerationWorker.connect();
   await postMediaModerationWorker.start();
   logger.info('rabbit mq post moderation worker started');
};

export const close = async () => {
   postMediaModerationWorker.stop();
   disconnectKafkaProducer();
};

const start = async () => {
   try {
      checkEnv();
      const modelPath = path.resolve('./ML-models/inception_v3/model.json');
      await nsfwImageClassifierService.loadModel({ modelPath, imageSize: 299 });
      await connectKafkaProducer();

      await startRabbitMqWorkers();

      process.on('SIGTERM', close);
      process.on('SIGINT', close);
   } catch (error) {
      console.log('error starting worker');
   }
};

start();
