import { UserUpdatedEventPayload } from 'humane-common';
import { z } from 'zod';

export const updateUserSchema = z.object({
   id: z.string().nonempty(),

   firstName: z.string().nonempty(),
   lastName: z.string().nullable(),
   bio: z.string().nullable(),

   avatarKey: z.string().nullable(),

   coverPhotoKey: z.string().nullable(),

   createdAt: z.string(),
   lastLoginTime: z.string().nullable(),

   isBlocked: z.boolean(),
   isHotUser: z.boolean(),

   humaneScore: z.number(),
});

export type UpdateUserDTO = z.infer<typeof updateUserSchema>;
const assertTypeCompatibility: <T extends UpdateUserDTO>() => void = () => {};
assertTypeCompatibility<UserUpdatedEventPayload>();
