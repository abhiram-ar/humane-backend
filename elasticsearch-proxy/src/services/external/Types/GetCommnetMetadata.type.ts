export type CommentMetadata = {
   id: string;
   likedByPostAuthor: boolean;
   likeCount: number;
   hasLikedByUser?: boolean;
};

export type GetCommentMetadataForAUser = {
   data: { commmentLikeMetadata: CommentMetadata[] };
};
