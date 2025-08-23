import { IPlatformRewardStats } from '@ports/usecases/admin/IPlatformRewardStats.usecase';
import { HttpStatusCode } from 'axios';
import { Request, Response, NextFunction } from 'express';
import { IAdminController } from '../interfaces/IAdmin.Controller';
import { IRewardConfigServices } from '@ports/usecases/reward/IRewardConfigService';
import { setRewardConfigInputSchema } from '@application/dto/setRewardConfig.dto';
import { ZodValidationError } from 'humane-common';
import { RewardPoints } from '@domain/RewardConfig';
import {
   getScoreListInputSchema,
   UserHydratedScoreData,
} from '@application/dto/GetScoreList.dto';
import { IUserQueryService } from '@ports/usecases/IUserQueryService';
import { BasicUserDetails } from '@application/types/BasicUserDetails';
import { IHumaneScoreServices } from '@ports/usecases/humaneScore/IHumaneScoreServices.usecase';
export class AdminController implements IAdminController {
   constructor(
      private readonly _plaformRewardStats: IPlatformRewardStats,
      private readonly _rewardConfigService: IRewardConfigServices,
      private readonly _scoreServices: IHumaneScoreServices,
      private readonly _userQueryService: IUserQueryService
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

   getRewardList = async (req: Request, res: Response, next: NextFunction) => {
      try {
         const { search, limit = '10', page = '1' } = req.query;

         const {
            data: validatedDTO,
            success,
            error,
         } = getScoreListInputSchema.safeParse({ search, limit, page });
         if (!success) throw new ZodValidationError(error);

         if (validatedDTO.search) {
         } else {
            const { rewards, pagination } = await this._scoreServices.getlist({
               page: validatedDTO.page,
               limit: validatedDTO.limit,
            });

            const userIds = rewards.map((reward) => reward.userId);
            const userDetails = await this._userQueryService.getUserBasicDetails(userIds);
            const userId2UserDetailsMap = new Map<string, BasicUserDetails>();
            userDetails.forEach((user) => {
               if (!user) return;
               userId2UserDetailsMap.set(user.id, user);
            });

            const hydratedRewards: UserHydratedScoreData[] = rewards.map((reward) => {
               const userDetails = userId2UserDetailsMap.get(reward.userId);

               return {
                  ...reward,
                  firstName: userDetails?.firstName,
                  lastName: userDetails?.lastName,
               };
            });

            res.status(HttpStatusCode.Ok).json({ data: { rewards: hydratedRewards, pagination } });
         }

         // find reward data
      } catch (error) {
         next(error);
      }
   };
}
