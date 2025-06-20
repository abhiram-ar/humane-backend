export class Like {
   public readonly createdAt?: Date;
   public updatedAt?: Date;
   constructor(public authorId: string, public commentId: string) {}
}
