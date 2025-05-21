import { UserCreatedEventPayload } from 'humane-common';
import { z } from 'zod';

export const createUserSchema = z.object({
   id: z.string().nonempty(),

   firstName: z.string().nonempty(),
   lastName: z.string().nullable(),
   bio: z.string().nullish(),

   avatarURL: z.string().nullish(),

   coverPhotoURL: z.string().nullish(),

   createdAt: z.string(),

   isBlocked: z.boolean(),
   isHotUser: z.boolean(),

   email: z.string().nonempty().email(),
});

export type CreateUserDTO = z.infer<typeof createUserSchema>;
const assertTypeCompatibility: <T extends UserCreatedEventPayload>() => void = () => {};
assertTypeCompatibility<CreateUserDTO>();
