export class Comment {
   public readonly id: string | undefined;
   public readonly createdAt: Date | undefined;
   public updatedAt?: Date;
   constructor(public authorId: string, public postId: string, public content: string) {}
}
