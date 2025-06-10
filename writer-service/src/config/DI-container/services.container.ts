import { PostService } from '@services/PostServices';
import { commentRepository, postRepoitory } from './repository.container';
import { CommentService } from '@services/CommentServices';
import { KafkaPublisher } from '@infrastructure/eventBus/KafkaPublisher';
import KafkaSingleton from '@infrastructure/eventBus/KafkaSingleton';

export const postService = new PostService(postRepoitory);
export const commentServices = new CommentService(commentRepository, postRepoitory);

export const eventPubliser = new KafkaPublisher(KafkaSingleton.getInstance());
