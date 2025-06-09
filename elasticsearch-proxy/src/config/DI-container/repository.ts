import { esClient } from '@config/esClient';
import { PostRepository } from '@repository/elasticsearch/post repository/PostRepository';
import { UserRepository } from '@repository/elasticsearch/user repository/UserRepository';

export const userRepository = new UserRepository();
export const postRepository = new PostRepository(esClient);
