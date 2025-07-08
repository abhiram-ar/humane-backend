export const conversationTypes = {
   ONE_TO_ONE: 'one-to-one',
   GROUP: 'group',
} as const;

export class Conversation {
   public readonly id?: string;
   public readonly type: (typeof conversationTypes)[keyof typeof conversationTypes];
   public groupName?: string; // only for groups
   public groupPicKey?: string; // only for groups

   public createdAt?: Date;
   public updatedAt?: Date;

   public participants: {
      userId: string;
      joinedAt: Date;
      clearedAt?: Date;
   }[];

   public lastMessageId?: string;
   constructor(fields: {
      type: (typeof conversationTypes)[keyof typeof conversationTypes];
      participants: string[];
      groupName?: string;
      groupPicKey?: string;
   }) {
      this.participants = fields.participants.map((userId) => ({ userId, joinedAt: new Date() }));
      this.type = fields.type;
      (this.groupName = fields.groupName), (this.groupPicKey = fields.groupPicKey);
   }
}
