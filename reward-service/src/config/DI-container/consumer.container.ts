import KafkaSingleton from '@infrastructure/eventBus/KafkaSingleton';
import { PostAuthorLikedCommentEventConsumer } from '@presentation/events/PostAuthorLikedCommentEvent.consumer';
import {
   issueChatRepliedWithinResonableTimeReward,
   issueHelpfulCommentReward,
} from './usecase/reward.usecase.constiner';
import { ChatMessagesSpecialEventsConsumer } from '@presentation/events/ChatMessageSpecialEvents.consumer';

export const postAuthorLikedCommentEventConsumer = new PostAuthorLikedCommentEventConsumer(
   KafkaSingleton.getInstance(),
   issueHelpfulCommentReward
);

export const chatMessageSpecialEventsConsumer = new ChatMessagesSpecialEventsConsumer(
   KafkaSingleton.getInstance(),
   issueChatRepliedWithinResonableTimeReward
);
