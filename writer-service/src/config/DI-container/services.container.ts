import { PostService } from '@services/PostServices';
import { commentRepository, likeReposotory, postRepoitory } from './repository.container';
import { CommentService } from '@services/CommentServices';
import { KafkaPublisher } from '@infrastructure/eventBus/KafkaPublisher';
import KafkaSingleton from '@infrastructure/eventBus/KafkaSingleton';
import { AWSStorageService } from '@infrastructure/storage/aws-s3/AWSStorageService';
import { LikeServices } from '@services/LikeServices';

export const postService = new PostService(postRepoitory);
export const commentServices = new CommentService(commentRepository, postRepoitory);

export const eventPubliser = new KafkaPublisher(KafkaSingleton.getInstance());

export const storageService = new AWSStorageService();

export const likeServices = new LikeServices(likeReposotory, eventPubliser);
