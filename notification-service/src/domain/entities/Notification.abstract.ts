export interface Notification {
   readonly id: string;
   readonly reciverId: string;
   isRead: boolean;
   type: string;
   actorId?: string;
   entityId: string;
   metadata?: Object;
   readonly createdAt: string;
   readonly updatedAt: string;
}
