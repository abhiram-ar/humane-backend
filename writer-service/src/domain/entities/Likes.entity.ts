export class Like {
   public readonly createdAt: Date | undefined;
   public updatedAt: Date | undefined;
   constructor(public actorId: string, public commentId: string) {}
}
