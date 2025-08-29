import { ChildProcess, spawn } from 'child_process';
import { logger } from '@config/logger';

import checkEnv, { ENV } from '@config/env';
import { startRabbiMqProducer, stopRabbitMQProducer } from '@config/rabbitMq';
import {
   connectKafkaProducer,
   disconnectKafkaProducer,
   startAllKafkaConsumers,
   stopAllKafkaConsumers,
} from '@config/kafka';
import app from '@presentation/http/server';

let childprocess: ChildProcess | undefined;

const bootstrap = async () => {
   try {
      checkEnv();

      process.on('SIGINT', shutdown);
      process.on('SIGTERM', shutdown);

      await startRabbiMqProducer();

      await connectKafkaProducer();
      await startAllKafkaConsumers();

      app.listen(ENV.SERVER_PORT, () => {
         logger.info('Moderation server started');
      });

      let retryCount = 0;
      const maxRetries = 3;
      const startChildProcess = () => {
         childprocess = spawn('tsx', ['./src/workerChildProcess.ts'], {
            stdio: 'inherit',
         });
         childprocess.on('spawn', () => logger.info('Child process started'));
         childprocess.on('error', (e) => logger.error(e));
         childprocess.on('exit', (code, signal) => {
            logger.debug(`Child process exited with code ${code} and signal ${signal}`);

            // dont restart if parent is shutting down
            if (!signal || signal === 'SIGTERM' || signal === 'SIGINT') return;

            if (retryCount < maxRetries) {
               retryCount++;
               logger.info(`restarting child process (attempt ${retryCount}/${maxRetries})...`);
               setTimeout(startChildProcess, 1000);
            } else if (retryCount >= maxRetries) {
               logger.error(`child process failed after ${maxRetries} restart attempt`);
               throw new Error('Child process dead');
            }
         });

         return childprocess;
      };
      startChildProcess();
      process.on('exit', shutdown);
   } catch (error) {
      logger.error('Error while starting moderation service', {error});
   }
};

const shutdown = () => {
   if (childprocess) childprocess.kill('SIGTERM');
   stopAllKafkaConsumers();
   disconnectKafkaProducer();

   // stopRabbitMqWorkers();
   stopRabbitMQProducer();
};

bootstrap();
