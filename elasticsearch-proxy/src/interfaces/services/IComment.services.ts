import { CreateCommentInputDTO } from 'interfaces/dto/post/Comment.dto';
import { GetCommentsInputDTO } from 'interfaces/dto/post/GetComments.dto';
import { ICommentDocument } from 'interfaces/ICommentDocument';
import { InfiniteScrollParamsV2 } from 'Types/InfinteScroll.type';

export interface ICommentService {
   upsert(dto: CreateCommentInputDTO): Promise<void>;
   delete(commentId: string): Promise<void>;
   deleteAllPostComments(postId: string): Promise<void>;

   getPostComments(
      dto: GetCommentsInputDTO
   ): Promise<{ comments: ICommentDocument[]; pagination: InfiniteScrollParamsV2 }>;

   getCommentByIds(commentId: string[]): Promise<(ICommentDocument | null)[]>;
}
