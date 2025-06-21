import KafkaSingleton from '@infrastructure/eventBus/KafkaSingleton';
import { CommentLikeWorker } from '@presentation/event/CommentLikeWorker.consumer';
import { commentServices, likeServices } from './services.container';
import { CommentLikeCountWorker } from '@presentation/event/CommentLikeCountWorker.consumer';

export const commentLikeWorker = new CommentLikeWorker(KafkaSingleton.getInstance(), likeServices);

export const commentLikeCountWorker = new CommentLikeCountWorker(
   KafkaSingleton.getInstance(),
   commentServices
);
