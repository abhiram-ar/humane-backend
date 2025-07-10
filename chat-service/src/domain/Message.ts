export class Message {
   public readonly id?: string;

   public readonly senderId: string;
   public readonly conversationId: string;
   public readonly message: string;

   public readonly sendAt: Date = new Date();
   public deletededFor: string[] = [];

   public attachment: { attachmentType: string; attachmentKey: string } | undefined;
   public replyToMessageId: string | undefined;

   constructor(fields: {
      senderId: string;
      conversationId: string;
      message: string;
      replyToMessageId?: string;
      attachment?: { attachmentType: string; attachmentKey: string };
   }) {
      this.senderId = fields.senderId;
      this.conversationId = fields.conversationId;
      this.message = fields.message;
      this.attachment = fields.attachment;
      this.replyToMessageId = fields.replyToMessageId;
   }
}
