export class Post {
   public readonly id?: string;
   public readonly createdAt?: Date;
   public updatedAt?: Date;
   constructor(public authorId: string, public content: string, public poster?: string) {}
}
