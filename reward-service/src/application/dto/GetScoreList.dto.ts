import { HumaneScore } from '@domain/HumaneScore';
import z from 'zod';

export const getScoreListInputSchema = z.object({
   search: z.string().nullish().optional(),
   page: z.coerce.number().positive(),
   limit: z.coerce.number().positive(),
});

export type GetScoreListInputDTO = z.infer<typeof getScoreListInputSchema>;

export type Pagination = {
   page: number;
   limit: number;
   totalItems: number;
   totalPages: number;
};

export type UserHydratedScoreData = Required<HumaneScore> & {
   firstName?: string | undefined | null;
   lastName?: string | undefined | null;
};

export type GetRewardListOutputDTO = {
   hydratedRewards: UserHydratedScoreData[];
   pagination: Pagination;
};
