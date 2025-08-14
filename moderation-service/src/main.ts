import { logger } from '@config/logger';
import { nsfwImageClassifierService } from '@di/services.container';
import path from 'path';
import checkEnv from '@config/env';
import {
   connectKafkaProducer,
   disconnectKafkaProducer,
   startAllConsumers,
   stopAllConsumers,
} from '@config/kafka';

const bootstrap = async () => {
   try {
      checkEnv();
      const modelPath = path.resolve('./ML-models/inception_v3/model.json');
      await nsfwImageClassifierService.loadModel({ modelPath, imageSize: 299 });

      process.on('SIGINT', shutdown);
      process.on('SIGTERM', shutdown);

      await connectKafkaProducer();
      await startAllConsumers();
   } catch (error) {
      logger.error('Error while starting moderation service');
      console.log(error);
   }
};

const shutdown = () => {
   stopAllConsumers();
   disconnectKafkaProducer();
};

bootstrap();
