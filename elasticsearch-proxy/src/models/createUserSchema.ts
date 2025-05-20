import { z } from 'zod';

export const createUserSchema = z.object({
   id: z.string().nonempty(),

   firstName: z.string().nonempty(),
   lastName: z.string().nullish(),
   bio: z.string().nullish(),

   avatarURL: z.string().nullish(),

   coverPhotoURL: z.string().nullish(),

   createdAt: z.string(),
   updatedAt: z.string(),
   lastLoginTime: z.string(),

   isBlocked: z.boolean(),
   isHotUser: z.boolean(),

   email: z.string().nonempty().email(),
});


export type CreateUser = z.infer<typeof createUserSchema>;
