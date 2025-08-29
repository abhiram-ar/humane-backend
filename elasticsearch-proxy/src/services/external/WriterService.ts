import axios from 'axios';
import { IExternalWriterService } from 'interfaces/services/IExternalWriterServices';
import { GetCommentMetadataForAUser } from './Types/GetCommnetMetadata.type';
import { logger } from '@config/logger';

export class ExternalWriterService implements IExternalWriterService {
   getCommentsMetadataOfAUser = async (
      commentIds: string[],
      userId?: string
   ): Promise<
      | { id: string; likeCount: number; likedByPostAuthor: boolean; hasLikedByUser?: boolean }[]
      | null
   > => {
      if (!commentIds) return null;
      if (commentIds.length === 0) return [];
      try {
         const res = await axios.get<GetCommentMetadataForAUser>(
            'http://writer-srv:3000/api/v1/internal/comment/metadata',
            {
               params: { userId, commentId: commentIds },
               paramsSerializer: {
                  indexes: null,
               },
            }
         );

         return res.data.data.commmentLikeMetadata;
      } catch (error) {
         logger.error('error while fetching comment metadata ', { error });
         return null;
      }
   };
}
