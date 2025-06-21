import { CommentMetadata } from '@services/external/Types/GetCommnetMetadata.type';
import { BasicUserDetails } from 'interfaces/dto/GetUserBasicProfileFromIDs';
import { ICommentDocument } from 'interfaces/ICommentDocument';

export type AuthorHydratedComment =
   | ICommentDocument
   | {
        author: BasicUserDetails | undefined;
        id: string;
        authorId: string;
        postId: string;
        content: string;
        createdAt: Date;
        updatedAt: Date;
     };

export type CommentMetaDataAndAuthorHydratedComment = AuthorHydratedComment & CommentMetadata;
