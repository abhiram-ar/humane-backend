export const messageType = {
   CALL: 'call',
   REGULAR: 'regular',
} as const;

export class Message {
   public readonly id?: string;

   public readonly senderId: string;
   public readonly conversationId: string;
   public readonly message: string | undefined;

   public readonly sendAt: Date = new Date();
   public status: { deleted: boolean; deletedAt: Date } | undefined;

   public attachment: { attachmentType: string; attachmentKey: string } | undefined;
   public replyToMessageId: string | undefined;

   public type: (typeof messageType)[keyof typeof messageType];
   public callConnected: boolean | undefined;

   constructor(fields: {
      senderId: string;
      conversationId: string;
      message?: string;
      type?: (typeof messageType)[keyof typeof messageType];
      replyToMessageId?: string;
      attachment?: { attachmentType: string; attachmentKey: string };
   }) {
      this.senderId = fields.senderId;
      this.conversationId = fields.conversationId;
      this.message = fields.message;
      this.attachment = fields.attachment;
      this.replyToMessageId = fields.replyToMessageId;
      this.type = fields.type ?? 'regular';
   }
}
