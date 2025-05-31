export abstract class Notification {
   constructor(
      public readonly id: string,
      public readonly createdAt: Date,
      public readonly reciverId: string,
      public isRead: boolean,
      public type: string,
      public readonly updatedAt: Date
   ) {}
}
