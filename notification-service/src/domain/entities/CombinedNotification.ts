import {
   COMMENT_LIKES_NOTIFICATION_TYPE,
   CommentLikesNotification,
} from './CommentLikesNotification';
import {
   FRIEND_REQ_ACCEPTED_NOTIFICATION_TYPE,
   FriendReqAcceptedNotification,
} from './FriendReqAcceptedNotification.entity';
import {
   FRIEND_REQ_NOTIFICATION_TYPE,
   FriendReqNotification,
} from './FriendReqNotification.entity';
import {
   POST_GOT_COMMNET_NOTIFICATION_TYPE,
   PostGotCommentNotification,
} from './PostGotCommnetNotification';

export const CombinedNotificationType = {
   FRIEND_REQ_NOTIFICATION_TYPE,
   FRIEND_REQ_ACCEPTED_NOTIFICATION_TYPE,
   POST_GOT_COMMNET_NOTIFICATION_TYPE,
   COMMENT_LIKES_NOTIFICATION_TYPE,
} as const;
export type CombinedNotification =
   | FriendReqNotification
   | FriendReqAcceptedNotification
   | PostGotCommentNotification
   | CommentLikesNotification;
