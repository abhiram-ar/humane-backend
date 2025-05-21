import { UpdateUserCoverPhotoKeyEventPayload } from 'humane-common';
import { z } from 'zod';

export const updateUserCoverPhotokeySchema = z.object({
   id: z.string().nonempty(),
   coverPhotoKey: z.string().nullable(),
});

export type UpdateUserCoverPhotoKeyDTO = z.infer<typeof updateUserCoverPhotokeySchema>;

const assertTypeCompatibility: <T extends UpdateUserCoverPhotoKeyEventPayload>() => void = () => {};
assertTypeCompatibility<UpdateUserCoverPhotoKeyDTO>();
