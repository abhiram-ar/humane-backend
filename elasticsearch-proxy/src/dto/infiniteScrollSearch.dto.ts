import { InfiniteScrollParams } from 'Types/InfinteScroll.type';
import { z } from 'zod';

export const infiniteScrollSearchSchema = z.object({
   searchQuery: z.string(),
   searchAfter: z.tuple([z.number()]).nullable(),
   limit: z.number(),
});
export type InfiniteScrollSearchDTO = z.infer<typeof infiniteScrollSearchSchema>;

export type InfiniteScrollSearchOutputDTO = {
   scroll: InfiniteScrollParams;
   users: {
      id: string;
      firstName: string;
      lastName: string | null;
      avatarURL: string | null;
   }[];
};
