import z from 'zod';

export const paginatedSearchSchema = z.object({
   search: z.string(),
   limit: z.number().nonnegative(),
   page: z.number().positive(),
});

export type PaginatedSearchDTO = z.infer<typeof paginatedSearchSchema>;
