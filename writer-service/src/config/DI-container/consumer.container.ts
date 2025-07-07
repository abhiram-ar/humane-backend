import KafkaSingleton from '@infrastructure/eventBus/KafkaSingleton';
import { CommentLikeWorker } from '@presentation/event/CommentLikeWorker.consumer';
import { commentServices, likeServices } from './services.container';
import { CommentLikeCountWorker } from '@presentation/event/CommentLikeCountWorker.consumer';
import { CommentUnlikeWorker } from '@presentation/event/CommentUnlikeWorker.consumer';
import { CommnetLikedByPostAuthorWorker } from '@presentation/event/CommnetLikedByPostAuthorWorker';
import { CommnetUnLikedByPostAuthorWorker } from '@presentation/event/CommnetUnLikedByPostAuthorWorker';

export const commentLikeWorker = new CommentLikeWorker(KafkaSingleton.getInstance(), likeServices);

export const commentLikeCountWorker = new CommentLikeCountWorker(
   KafkaSingleton.getInstance(),
   commentServices
);

export const commentUnlikedWorker = new CommentUnlikeWorker(
   KafkaSingleton.getInstance(),
   likeServices
);

export const commentLikedByPostAuthorWorker = new CommnetLikedByPostAuthorWorker(
   KafkaSingleton.getInstance(),
   commentServices
);

export const commnetUnLikedByPostAuthorWorker = new CommnetUnLikedByPostAuthorWorker(
   KafkaSingleton.getInstance(),
   commentServices
);
