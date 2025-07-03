import { PostService } from '@services/PostServices';
import {
   commentRepository,
   hashtagReposityory,
   likeReposotory,
   postRepoitory,
} from './repository.container';
import { CommentService } from '@services/CommentServices';
import { KafkaPublisher } from '@infrastructure/eventBus/KafkaPublisher';
import KafkaSingleton from '@infrastructure/eventBus/KafkaSingleton';
import { AWSStorageService } from '@infrastructure/storage/aws-s3/AWSStorageService';
import { LikeServices } from '@services/LikeServices';
import { HashtagServices } from '@services/HashtagServices';

export const eventPubliser = new KafkaPublisher(KafkaSingleton.getInstance());

export const postService = new PostService(postRepoitory);

export const commentServices = new CommentService(commentRepository, postRepoitory, eventPubliser);

export const storageService = new AWSStorageService();

export const likeServices = new LikeServices(likeReposotory, eventPubliser);

export const hashtagServices = new HashtagServices(hashtagReposityory);
