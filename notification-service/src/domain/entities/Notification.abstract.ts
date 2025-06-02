export abstract class Notification {
   public readonly id: string | undefined;
   public readonly createdAt: String | undefined;
   public readonly reciverId: string | undefined;
   public isRead: boolean | undefined;
   public type: string | undefined;
   public readonly updatedAt?: string;
   constructor() {}
}
