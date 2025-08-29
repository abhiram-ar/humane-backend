import checkEnv, { ENV } from '@config/env';
import {
   connectKafkaProducer,
   disconnectKafkaProducer,
   startAllConsumer,
   stopAllConsumer,
} from '@config/kafka';
import { rewardConfigServices } from '@di/usecase/reward.usecase.constiner';
import db from '@infrastructure/persistance/postgres/prisma-client';
import app from '@presentation/http/server';
import { logger } from '@config/logger';

const bootStrap = async () => {
   try {
      checkEnv();
      await db.$connect();
      await rewardConfigServices.initializeRewardAmount();

      await connectKafkaProducer();
      await startAllConsumer();

      process.on('SIGINT', cleanup);
      process.on('SIGTERM', cleanup);

      app.listen(ENV.SERVER_PORT, () => {
         logger.info(`Reward service stated listening on port ${ENV.SERVER_PORT}`);
         logger.info('Reward service fully opeational');
      });
   } catch (error) {
      logger.error('erorr while starting reward service', { error });
   }
};

const cleanup = () => {
   disconnectKafkaProducer();
   stopAllConsumer();
};

bootStrap();
