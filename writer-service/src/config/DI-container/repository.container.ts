import { CommentRepository } from '@infrastructure/persistance/MongoDB/repository/commentRepository';
import { LikeRepository } from '@infrastructure/persistance/MongoDB/repository/LikeRepository';
import { PostRepository } from '@infrastructure/persistance/MongoDB/repository/PostRepository';

export const postRepoitory = new PostRepository();
export const commentRepository = new CommentRepository();

export const likeReposotory = new LikeRepository();
