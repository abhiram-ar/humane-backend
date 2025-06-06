import { logger } from '@config/logget';
import app from '@presentation/http/app';

console.log('hello from writeer srv');

const bootstrap = () => {
   try {
      app.listen(3000, () => {
         logger.info('writer server started on port 3000');
      });
   } catch (error) {
      logger.error('Error starting writer service');
      logger.error(JSON.stringify(error, null, 2));
   }
};
bootstrap();
