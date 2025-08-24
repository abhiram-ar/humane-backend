import { HumaneScore } from '@domain/HumaneScore';
import { IHumaneScoreRepository } from '@ports/repository/IHumaneScoreRepository';
import db from '../prisma-client';

export class HumaneScoreRepository implements IHumaneScoreRepository {
   create = async (entity: HumaneScore): Promise<Required<HumaneScore>> => {
      const res = await db.humaneScore.create({
         data: { userId: entity.userId, score: entity.score },
      });
      return res;
   };
   get = async (id: string): Promise<HumaneScore | null> => {
      const res = await db.humaneScore.findUnique({ where: { userId: id } });
      return res;
   };
   delete = async (id: string): Promise<HumaneScore | null> => {
      try {
         const res = await db.humaneScore.delete({ where: { userId: id } });
         return res;
      } catch (error) {
         return null;
      }
   };

   getlist = async (config: {
      userIds?: string[];
      page: number;
      limit: number;
   }): Promise<{
      rewards: Required<HumaneScore>[];
      totalItems: number;
   }> => {
      const skip = (config.page - 1) * config.limit;
      const res = await db.humaneScore.findMany({
         where: config.userIds ? { userId: { in: config.userIds } } : {},
         skip,
         take: config.limit,
      });

      const count = await db.humaneScore.count();

      return {
         rewards: res,
         totalItems: count,
      };
   };
}
