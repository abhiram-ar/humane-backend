import { IPlatformRewardStats } from '@ports/usecases/admin/IPlatformRewardStats.usecase';
import { HttpStatusCode } from 'axios';
import { Request, Response, NextFunction } from 'express';
import { IAdminController } from '../interfaces/IAdmin.Controller';
import { IRewardConfigServices } from '@ports/usecases/reward/IRewardConfigService';
import { setRewardConfigInputSchema } from '@application/dto/setRewardConfig.dto';
import { ZodValidationError } from 'humane-common';
import { RewardPoints } from '@domain/RewardConfig';
export class AdminController implements IAdminController {
   constructor(
      private readonly _plaformRewardStats: IPlatformRewardStats,
      private readonly _rewardConfigService: IRewardConfigServices
   ) {}

   getPlatfromRewardStats = async (req: Request, res: Response, next: NextFunction) => {
      try {
         const result = await this._plaformRewardStats.execute();

         res.status(HttpStatusCode.Ok).json({ data: result });
      } catch (error) {
         next(error);
      }
   };

   getRewardConfig = async (req: Request, res: Response, next: NextFunction) => {
      try {
         const configs = await this._rewardConfigService.getFullConfig();

         const parsed: Record<string, number> = {};
         configs.forEach((config) => (parsed[config.type] = config.amount));

         res.status(HttpStatusCode.Ok).json({ data: parsed });
      } catch (error) {
         next(error);
      }
   };

   setRewardConfig = async (req: Request, res: Response, next: NextFunction) => {
      try {
         const validatedDTO = setRewardConfigInputSchema.safeParse(req.body);
         if (!validatedDTO.success) throw new ZodValidationError(validatedDTO.error);

         for (let [key, value] of Object.entries(validatedDTO.data)) {
            const typedkey = key as keyof RewardPoints;
            await this._rewardConfigService.setAmount(typedkey, value);
         }

         res.status(HttpStatusCode.Ok).json({ success: true });
      } catch (error) {
         next(error);
      }
   };
}
