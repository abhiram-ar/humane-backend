export const EntityType = {
   POST: 'post',
   COMMENT: 'comment',
} as const;

export class Like {
   public readonly createdAt: Date | undefined;
   public updatedAt: Date | undefined;
   constructor(
      public actorId: string,
      public entityType: (typeof EntityType)[keyof typeof EntityType],
      public entiryId: string
   ) {}
}
