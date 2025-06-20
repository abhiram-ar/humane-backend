export class Like {
   public readonly createdAt: Date | undefined;
   public updatedAt: Date | undefined;
   constructor(public authorId: string, public commentId: string) {}
}
