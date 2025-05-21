import { UserCreatedEventPayload } from 'humane-common';
import { z } from 'zod';

export const createUserSchema = z.object({
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

   email: z.string().nonempty(),
   humaneScore: z.number(),
});

export type CreateUserDTO = z.infer<typeof createUserSchema>;
const assertTypeCompatibility: <T extends CreateUserDTO>() => void = () => {};
assertTypeCompatibility<UserCreatedEventPayload>();
