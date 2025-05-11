import { AuthorizationError } from '@application/errors/AuthorizationError';
import { UserNotFoundError } from '@application/errors/UserNotFoundError';
import { GetCurrentAnonProfile } from '@application/useCases/anonymous/GetCurrentAnonProfile';
import { UpdateAnonProfile } from '@application/useCases/anonymous/UpdateAnonProfile';
import { getCurrentAnonProfileSchema } from '@dtos/anonymous/getCurrentAnonProfile.input.dto';
import { updateAnonProfileSchema } from '@dtos/anonymous/updateAnonProfile.input.dto';
import { ZodValidationError } from '@presentation/errors/ZodValidationError';
import { NextFunction, Request, Response } from 'express';

export class AnonProfileController {
   constructor(
      private readonly _getCurrentAnonProfile: GetCurrentAnonProfile,
      private readonly _updateAnonProfile: UpdateAnonProfile
   ) {}

   getProfile = async (req: Request, res: Response, next: NextFunction) => {
      try {
         if (req.user?.type !== 'anon') {
            throw new AuthorizationError('only anon can user this resource');
         }

         const parsed = getCurrentAnonProfileSchema.safeParse({
            anonId: req.user?.anonId,
         });

         if (!parsed.success) {
            throw new ZodValidationError(parsed.error);
         }

         const profile = await this._getCurrentAnonProfile.execute(parsed.data);

         res.status(200).json({
            success: true,
            message: 'Anon profile successfully fetched',
            data: { profile },
         });
      } catch (error) {
         next(error);
      }
   };

   updateProfile = async (req: Request, res: Response, next: NextFunction) => {
      try {
         if (req.user?.type !== 'anon') {
            throw new AuthorizationError('only anon can user this resource');
         }

         if (!req.user.anonId) {
            throw new UserNotFoundError('anonId is missing');
         }

         const parsed = updateAnonProfileSchema.safeParse(req.body);
         if (!parsed.success) {
            throw new ZodValidationError(parsed.error);
         }

         const updatedProfile = await this._updateAnonProfile.execute(req.user.anonId, parsed.data);

         res.status(201).json({
            success: true,
            message: 'profile updated',
            data: { profile: updatedProfile },
         });
      } catch (error) {
         next(error);
      }
   };
}
