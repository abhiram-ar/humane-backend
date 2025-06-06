import { CommentRepository } from '@infrastructure/persistance/MongoDB/repository/commentRepository';
import { PostRepository } from '@infrastructure/persistance/MongoDB/repository/PostRepository';

export const postRepoitory = new PostRepository();
export const commentRepository = new CommentRepository();
