import { Reward } from '@domain/Reward.entity';
import { IRewardRepostory } from '@ports/repository/IRewardRepository';
import db from '../prisma-client';
import { Prisma, RewardType } from '../../../../../generated/prisma';
import { logger } from '@config/logger';

export class RewardRepository implements IRewardRepostory {
   platformTotalRewards = async (dto: { from?: Date; filter?: RewardType }): Promise<number> => {
      const where: Prisma.RewardsWhereInput = {};

      if (dto.filter) {
         where.type = dto.filter;
      }

      if (dto.from) {
         where.createdAt = {
            gte: dto.from,
         };
      }

      const res = await db.rewards.aggregate({
         where,
         _sum: {
            pointsRewarded: true,
         },
      });

      return res._sum.pointsRewarded ?? 0;
   };
   create = async (entity: Reward): Promise<Required<Reward> | null> => {
      let res: Required<Reward> | null = null;

      try {
         await db.$transaction(async (tx) => {
            await tx.humaneScore.upsert({
               where: { userId: entity.actorId },
               update: { score: { increment: entity.pointsRewarded } },
               create: { userId: entity.actorId, score: entity.pointsRewarded },
            });

            res = await tx.rewards.create({
               data: {
                  actorId: entity.actorId,
                  pointsRewarded: entity.pointsRewarded,
                  type: entity.type,
                  idempotencyKey: entity.idempotencyKey,
               },
            });
         });
      } catch (e) {
         if (e instanceof Prisma.PrismaClientKnownRequestError) {
            if (e.code === 'P2002') {
               logger.warn('Unique constaraint violation, Cannot issue reward');
               res = null;
            }
         } else {
            throw e;
         }
      }
      return res;
   };

   findLastReward = async (dto: {
      type: RewardType;
      userId: string;
   }): Promise<Required<Reward> | null> => {
      const res = db.rewards.findFirst({
         where: { actorId: dto.userId, type: dto.type },
         orderBy: { createdAt: 'desc' },
      });
      return res;
   };
   get(id: string): Promise<Reward | null> {
      throw new Error('Method not implemented.');
   }
   delete(id: string): Promise<Reward | null> {
      throw new Error('Method not implemented.');
   }
}
