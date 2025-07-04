import { Reward } from '@domain/Reward.entity';
import { IRewardRepostory } from '@ports/repository/IRewardRepository';
import db from '../prisma-client';
import { Prisma } from '../../../../../generated/prisma';
import { logger } from '@config/logger';

export class RewardRepository implements IRewardRepostory {
   create = async (entity: Reward): Promise<Required<Reward> | null> => {
      try {
         await db.$transaction(async (tx) => {
            await tx.humaneScore.upsert({
               where: { userId: entity.actorId },
               update: { score: { increment: entity.pointsRewarded } },
               create: { userId: entity.actorId, score: entity.pointsRewarded },
            });

            const res = await tx.rewards.create({
               data: {
                  actorId: entity.actorId,
                  pointsRewarded: entity.pointsRewarded,
                  type: entity.type,
                  idempotencyKey: entity.idempotencyKey,
               },
            });
            return res;
         });
      } catch (e) {
         if (e instanceof Prisma.PrismaClientKnownRequestError) {
            if (e.code === 'P2002') {
               logger.warn('Unique constaraint violation, Cannot issue reward');
               return null;
            }
         }
         throw e;
      }

      return null;
   };
   get(id: string): Promise<Reward | null> {
      throw new Error('Method not implemented.');
   }
   delete(id: string): Promise<Reward | null> {
      throw new Error('Method not implemented.');
   }
}
