import { z } from 'zod';

const appendPostToMultipleUserTimeline = z.object({
   userIds: z.array(z.string().nonempty()),
   postId: z.string().nonempty(),
   authorId: z.string().nonempty(),
   createdAt: z.coerce.date(),
});

export type AppendPostToMultipleUserTimelineInputDTO = z.infer<
   typeof appendPostToMultipleUserTimeline
>;
