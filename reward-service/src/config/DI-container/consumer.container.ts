import KafkaSingleton from '@infrastructure/eventBus/KafkaSingleton';
import { PostAuthorLikedCommentEventConsumer } from '@presentation/events/PostAuthorLikedCommentEvent.consumer';
import { issueHelpfulCommentReward } from './usecase/reward.usecase.constiner';

export const postAuthorLikedCommentEventConsumer = new PostAuthorLikedCommentEventConsumer(
   KafkaSingleton.getInstance(),
   issueHelpfulCommentReward
);
