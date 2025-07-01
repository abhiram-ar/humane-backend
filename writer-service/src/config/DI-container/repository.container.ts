import { CommentRepository } from '@infrastructure/persistance/MongoDB/repository/commentRepository';
import { HashTagRepository } from '@infrastructure/persistance/MongoDB/repository/hashtagRepository';
import { LikeRepository } from '@infrastructure/persistance/MongoDB/repository/LikeRepository';
import { PostRepository } from '@infrastructure/persistance/MongoDB/repository/PostRepository';

export const postRepoitory = new PostRepository();
export const commentRepository = new CommentRepository();

export const likeReposotory = new LikeRepository();

export const hashtagReposityory = new HashTagRepository();
