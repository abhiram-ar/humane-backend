import { z } from 'zod';

export const hydratePostDetailsSchema = z.array(z.string().nonempty());

export type HydrartePostDetailsInputDTO = z.infer<typeof hydratePostDetailsSchema>;
