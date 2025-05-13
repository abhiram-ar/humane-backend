import { AuthorizationError } from '@application/errors/AuthorizationError';
import { UserNotFoundError } from '@application/errors/UserNotFoundError';
import { GeneratePresignedURL } from '@application/useCases/anonymous/GeneratePresignedURL';
import { GetCurrentAnonProfile } from '@application/useCases/anonymous/GetCurrentAnonProfile';
import { UpdateAnonAvatar } from '@application/useCases/anonymous/UpdateAnonAvatar';
import { UpdateAnonCoverPhoto } from '@application/useCases/anonymous/UpdateAnonCoverPhoto';
import { UpdateAnonProfile } from '@application/useCases/anonymous/UpdateAnonProfile';
import { generatePresignedURLInputSchema } from '@dtos/anonymous/generatePreSignedURL.input.dto';
import { getCurrentAnonProfileSchema } from '@dtos/anonymous/getCurrentAnonProfile.input.dto';
import { updateAnonCoverPhotoSchema } from '@dtos/anonymous/updateAnonCoverPhoto.input.dto';
import { updateAnonProfileSchema } from '@dtos/anonymous/updateAnonProfile.input.dto';
import { updateAnonAvatarSchema } from '@dtos/anonymous/updateAnonProfileAvatar.input.dto';
import { ZodValidationError } from '@presentation/errors/ZodValidationError';
import { NextFunction, Request, Response } from 'express';

export class AnonProfileController {
   constructor(
      private readonly _getCurrentAnonProfile: GetCurrentAnonProfile,
      private readonly _updateAnonProfile: UpdateAnonProfile,
      private readonly _generatePreSignedURL: GeneratePresignedURL,
      private readonly _updateAnonAvatar: UpdateAnonAvatar,
      private readonly _updateAnonCoverPhoto: UpdateAnonCoverPhoto
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

   generatePreSignedURL = async (req: Request, res: Response, next: NextFunction) => {
      try {
         const parsed = generatePresignedURLInputSchema.safeParse(req.body);
         if (!parsed.success) {
            throw new ZodValidationError(parsed.error);
         }

         const preSignedURL = await this._generatePreSignedURL.execute(parsed.data);

         res.status(201).json({
            success: true,
            message: `presigned url created for ${parsed.data.fileName} with  mimeType:${parsed.data.mimeType}`,
            data: {
               preSignedURL,
            },
         });
      } catch (error) {
         next(error);
      }
   };

   updateAvatarPhoto = async (req: Request, res: Response, next: NextFunction) => {
      try {
         if (req.user?.type !== 'anon') {
            throw new AuthorizationError('only anon can user this resource');
         }

         const anonId = req.user.anonId;
         if (!anonId) {
            throw new UserNotFoundError('no anonId in resolved JWT bearer');
         }

         const parsed = updateAnonAvatarSchema.safeParse(req.body);
         if (!parsed.success) {
            throw new ZodValidationError(parsed.error);
         }

         const { updatedAvatarKey, newAvatarURL } = await this._updateAnonAvatar.execute(
            anonId,
            parsed.data
         );

         res.status(201).json({
            success: true,
            message: 'user profile picture updated',
            data: {
               avatarKey: updatedAvatarKey,
               avatarURL: newAvatarURL,
            },
         });
      } catch (error) {
         next(error);
      }
   };

   updateCoverPhoto = async (req: Request, res: Response, next: NextFunction) => {
      try {
         if (req.user?.type !== 'anon') {
            throw new AuthorizationError('only anon can user this resource');
         }

         const anonId = req.user.anonId;
         if (!anonId) {
            throw new UserNotFoundError('no anonId in resolved JWT bearer');
         }

         const parsed = updateAnonCoverPhotoSchema.safeParse(req.body);
         if (!parsed.success) {
            throw new ZodValidationError(parsed.error);
         }

         const { updatedCoverPhotoKey, newCoverPhotoURL } =
            await this._updateAnonCoverPhoto.execute(anonId, parsed.data);

         res.status(201).json({
            success: true,
            message: 'user profile picture updated',
            data: {
               coverPhoto: updatedCoverPhotoKey,
               coverPhotoURL: newCoverPhotoURL,
            },
         });
      } catch (error) {
         next(error);
      }
   };
}
