import { IRewardConfigRepositoy } from '@ports/repository/IRewardConfigRepository';
import { RewardConfig, $Enums } from '../../../../../generated/prisma';
import db from '../prisma-client';

export class RewardConfigRepository implements IRewardConfigRepositoy {
   findAll = async (): Promise<RewardConfig[]> => {
      return db.rewardConfig.findMany();
   };
   setAmount = async (entity: RewardConfig): Promise<RewardConfig> => {
      const res = await db.rewardConfig.upsert({
         where: { type: entity.type },
         update: { amount: entity.amount },
         create: { type: entity.type, amount: entity.amount },
      });
      return res;
   };
   create = async (entity: {
      type: $Enums.RewardType;
      amount: number;
   }): Promise<Required<{ type: $Enums.RewardType; amount: number }> | null> => {
      try {
         const res = await db.rewardConfig.create({ data: entity });
         return res;
      } catch (error) {
         return null;
      }
   };
   get = async (
      id: $Enums.RewardType
   ): Promise<{ type: $Enums.RewardType; amount: number } | null> => {
      const res = await db.rewardConfig.findFirst({ where: { type: id } });
      return res;
   };
   delete = async (
      id: $Enums.RewardType
   ): Promise<{ type: $Enums.RewardType; amount: number } | null> => {
      const res = await db.rewardConfig.findFirst({ where: { type: id } });
      return res;
   };
}
