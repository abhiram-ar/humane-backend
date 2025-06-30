import { PostVisibility } from '@domain/entities/Post.entity';
import { z } from 'zod';
export const createPostSchema = z.object({
   authorId: z.string().nonempty(),
   content: z.string().trim().nonempty().max(256),
   visibility: z.enum([PostVisibility.FRIENDS, PostVisibility.PUBLIC]),
   attachmentType: z
      .string()
      .refine(
         (val) => val.startsWith('image') || val.startsWith('video'),
         'post attachement can only be image or video'
      )
      .optional(),
   attachmentKey: z.string().nullish().optional(),
});

export type CreatePostDTO = z.infer<typeof createPostSchema>;
