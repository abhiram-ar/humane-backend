import { AuthorizationError } from '@application/errors/AuthorizationError';
import { GetCurrentAnonProfile } from '@application/useCases/anonymous/GetCurrentUserDetails';
import { getCurrentAnonProfileSchema } from '@dtos/anonymous/getCurrentAnonProfile.input.dto';
import { ZodValidationError } from '@presentation/errors/ZodValidationError';
import { NextFunction, Request, Response } from 'express';

export class AnonProfileController {
   constructor(private readonly _getCurrentAnonProfile: GetCurrentAnonProfile) {}

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
}
