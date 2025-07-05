import { z } from 'zod';

export const getUserProfileSchema = z.string().nonempty();

export type GetUserProfileOutputDTO = {
   id: string;
   firstName: string;
   lastName?: string | null;
   bio?: string | null;
   createdAt: string;
   avatarURL?: string;
   coverPhotoURL?: string;
   humaneScore: number;
};
