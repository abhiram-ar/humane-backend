import {
   connectKafkaProducer,
   disconnectKafkaProducer,
   startAllConsumer,
   stopAllConsumer,
} from '@config/kafka';
import { logger } from '@config/logget';
import connectDB from '@infrastructure/persistance/MongoDB/mongoDBclient';
import app from '@presentation/http/app';

const bootstrap = async () => {
   try {
      await connectDB();

      await connectKafkaProducer();
      process.on('SIGINT', cleanup);
      process.on('SIGTERM', cleanup);

      app.listen(3000, () => {
         logger.info('writer server started on port 3000');
      });

      await startAllConsumer();
      logger.info('writer server full operational');
   } catch (error) {
      logger.error('Error starting writer service');
      logger.error(JSON.stringify(error, null, 2));
   }
};

const cleanup = () => {
   stopAllConsumer();
   disconnectKafkaProducer();
};

bootstrap();
