import { UpdateUserAvatarKeyEventPayload, } from 'humane-common';
import { z } from 'zod';

export const updateUserAvatarKeySchema = z.object({
   id: z.string().nonempty(),
   avatarKey: z.string().nullable(),
});

export type UpdateUserAvatarKeyDTO = z.infer<typeof updateUserAvatarKeySchema>;

const assertTypeCompatibility: <T extends UpdateUserAvatarKeyDTO>() => void = () => {};
assertTypeCompatibility<UpdateUserAvatarKeyEventPayload>();
