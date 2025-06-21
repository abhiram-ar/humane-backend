export class Comment {
   public readonly id?: string;
   public readonly createdAt?: Date;
   public updatedAt?: Date;

   public likeCount?: number;
   public likedByPostAuthor?: boolean;
   constructor(public authorId: string, public postId: string, public content: string) {}
}
