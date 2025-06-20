import KafkaSingleton from '@infrastructure/eventBus/KafkaSingleton';
import { CommentLikeWorker } from '@presentation/event/CommentLikeWorker.consumer';
import { likeServices } from './services.container';

export const commentLikeWorker = new CommentLikeWorker(KafkaSingleton.getInstance(), likeServices);
