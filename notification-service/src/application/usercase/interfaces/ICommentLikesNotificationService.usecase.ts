import { CommnetLikeDTO } from '@application/dtos/CommentLike.dto';
import { CommentLikesNotification } from '@domain/entities/CommentLikesNotification';

export interface ICommentLikesNotificationService {
   create(commnetLike: CommnetLikeDTO): Promise<Required<CommentLikesNotification> | null>;
   deleteCommentLikesNotificationByCommentId(commentId: string): Promise<void>;
}
