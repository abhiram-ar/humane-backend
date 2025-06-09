import { esClient } from '@config/esClient';
import { CommetRepository } from '@repository/elasticsearch/comment repository/CommentRepository';
import { PostRepository } from '@repository/elasticsearch/post repository/PostRepository';
import { UserRepository } from '@repository/elasticsearch/user repository/UserRepository';

export const userRepository = new UserRepository();
export const postRepository = new PostRepository(esClient);
export const commentRepository = new CommetRepository(esClient);
