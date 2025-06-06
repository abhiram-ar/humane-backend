import { logger } from '@config/logget';
import connectDB from '@infrastructure/persistance/MongoDB/mongoDBclient';
import app from '@presentation/http/app';


const bootstrap = async () => {
   try {
      await connectDB();
      app.listen(3000, () => {
         logger.info('writer server started on port 3000');
      });
   } catch (error) {
      logger.error('Error starting writer service');
      logger.error(JSON.stringify(error, null, 2));
   }
};
bootstrap();
