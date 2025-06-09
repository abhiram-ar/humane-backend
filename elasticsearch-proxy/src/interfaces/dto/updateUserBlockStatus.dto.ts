import { UpdateUserBlockStatusEventPaylaod } from 'humane-common';
import { z } from 'zod';

export const updateUserBlockStatusSchema = z.object({
   id: z.string().nonempty(),
   isBlocked: z.boolean(),
});

export type UpdaeteUserBlockStautsDTO = z.infer<typeof updateUserBlockStatusSchema>;

const assertTypeCompatibility: <T extends UpdateUserBlockStatusEventPaylaod>() => void = () => {};
assertTypeCompatibility<UpdaeteUserBlockStautsDTO>();
