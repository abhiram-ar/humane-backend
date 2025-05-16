import { AuthorizationError } from '@application/errors/AuthorizationError';
import { UserNotFoundError } from '@application/errors/UserNotFoundError';
import { GeneratePresignedURL } from '@application/useCases/user/GeneratePresignedURL';
import { GetCurrentUserProfile } from '@application/useCases/user/GetCurrentUserProfile';
import { UpdateUserAvatar } from '@application/useCases/user/UpdateUserAvatar';
import { UpdateUserCoverPhoto } from '@application/useCases/user/UpdateUserCoverPhoto';
import { UpdateUserProfile } from '@application/useCases/user/UpdateUserProfile';
import { generatePresignedURLInputSchema } from '@dtos/user/generatePreSignedURL.input.dto';
import { getCurrentAnonProfileSchema } from '@dtos/user/getCurrentAnonProfile.input.dto';
import { updateUserCoverPhotoSchema } from '@dtos/user/updateUserCoverPhoto.input.dto';
import { updateUserProfileSchema } from '@dtos/user/updateUserProfile.input.dto';
import { updateUserAvatarSchema } from '@dtos/user/updateAnonProfileAvatar.input.dto';
import { ZodValidationError } from '@presentation/errors/ZodValidationError';
import { NextFunction, Request, Response } from 'express';

export class UserProfileController {
   constructor(
      private readonly _getCurrentUserProfile: GetCurrentUserProfile,
      private readonly _updateUserProfile: UpdateUserProfile,
      private readonly _generatePreSignedURL: GeneratePresignedURL,
      private readonly _updatUserAvatar: UpdateUserAvatar,
      private readonly _updateUserCoverPhoto: UpdateUserCoverPhoto
   ) {}

   getProfile = async (req: Request, res: Response, next: NextFunction) => {
      try {
         if (req.user?.type !== 'user') {
            throw new AuthorizationError('only user can user this resource');
         }

         const parsed = getCurrentAnonProfileSchema.safeParse({
            userId: req.user?.userId,
         });

         if (!parsed.success) {
            throw new ZodValidationError(parsed.error);
         }

         const profile = await this._getCurrentUserProfile.execute(parsed.data);

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
         if (req.user?.type !== 'user') {
            throw new AuthorizationError('only user can user this resource');
         }

         if (!req.user.userId) {
            throw new UserNotFoundError('userId is missing');
         }

         const parsed = updateUserProfileSchema.safeParse(req.body);
         if (!parsed.success) {
            throw new ZodValidationError(parsed.error);
         }

         const updatedProfile = await this._updateUserProfile.execute(req.user.userId, parsed.data);

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
         if (req.user?.type !== 'user') {
            throw new AuthorizationError('only user can user this resource');
         }

         const userId = req.user.userId;
         if (!userId) {
            throw new UserNotFoundError('no userId in resolved JWT bearer');
         }

         const parsed = updateUserAvatarSchema.safeParse(req.body);
         if (!parsed.success) {
            throw new ZodValidationError(parsed.error);
         }

         const { updatedAvatarKey, newAvatarURL } = await this._updatUserAvatar.execute(
            userId,
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
         if (req.user?.type !== 'user') {
            throw new AuthorizationError('only anon can user this resource');
         }

         const userId = req.user.userId;
         if (!userId) {
            throw new UserNotFoundError('no userId in resolved JWT bearer');
         }

         const parsed = updateUserCoverPhotoSchema.safeParse(req.body);
         if (!parsed.success) {
            throw new ZodValidationError(parsed.error);
         }

         const { updatedCoverPhotoKey, newCoverPhotoURL } =
            await this._updateUserCoverPhoto.execute(userId, parsed.data);

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
