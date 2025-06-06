export class Comment {
   public readonly id?: string;
   public readonly createdAt?: Date;
   public updatedAt?: Date;
   constructor(public authorId: string, public content: string) {}
}
