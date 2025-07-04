import { logger } from '@config/logger';
import { rewardRepository } from '@di/repository.container';
import { issueHelpfulCommentReward } from '@di/usecase/reward.usecase.constiner';
import db from '@infrastructure/persistance/postgres/prisma-client';

const bootStrap = async () => {
   try {
      await db.$connect();
      rewardRepository.create({
         idempotencyKey: 'idem2',
         actorId: 'actid',
         pointsRewarded: 20,
         type: 'CHAT_DAILY_CHECKIN',
      });

      issueHelpfulCommentReward.execute({
         postAuthorId: 'postAU',
         postId: 'shjo',
         commentAutorId: 'comAu',
         commentId: 'voo',
      });

      logger.info('Reward service fully opeational');
   } catch (error) {
      logger.error('erorr while starting reward service');
      console.log(error);
   }
};

bootStrap();
