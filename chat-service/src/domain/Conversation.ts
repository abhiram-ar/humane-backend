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

   public participants: string[];
   constructor(fields: {
      type: (typeof conversationTypes)[keyof typeof conversationTypes];
      participants: string[];
   }) {
      this.participants = fields.participants;
      this.type = fields.type;
   }
}
