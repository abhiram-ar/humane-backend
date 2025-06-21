export class Comment {
   public readonly id?: string;
   public readonly createdAt?: Date;
   public updatedAt?: Date;

   public likeCount?: number; // not replicted in ES
   public likedByPostAuthor?: boolean; // not replicated in ES
   constructor(public authorId: string, public postId: string, public content: string) {}
}
