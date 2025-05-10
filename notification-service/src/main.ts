import checkEnv, { ENV } from '@config/env';
import { connectKafkaProducer, disconnectKafkaProducer } from '@config/kafka';
import { userPasswordRecoveryRequestEventConsumer } from '@DI-container/consumers/sendEmailConsumer.container';
import app from '@presentation/http/server';

const boostrap = async () => {
   try {
      checkEnv();

      await connectKafkaProducer();
      process.on('SIGINT', async () => {
         await disconnectKafkaProducer();
      });
      process.on('SIGTERM', async () => {
         await disconnectKafkaProducer();
      });

      userPasswordRecoveryRequestEventConsumer.start();

      app.listen(ENV.SERVER_PORT, () => console.log('nofitcation started on port 3000'));
   } catch (error) {
      console.error('error while starting notification service');
      console.error(error);
   }
};

boostrap();
