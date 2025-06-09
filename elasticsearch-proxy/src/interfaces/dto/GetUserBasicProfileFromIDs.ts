import { z } from 'zod';

export const getUserBasicProfileFromIdsSchema = z.array(z.string().nonempty());

export type GetUserBasicProfileFromIdsInputDTO = z.infer<typeof getUserBasicProfileFromIdsSchema>;

export type GetBasicUserProfileFromIdsOutputDTO = ({
   id: string;
   firstName: string;
   lastName?: string | null;
   avatarURL?: string;
}|null)[];
