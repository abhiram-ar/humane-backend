import {
   FRIEND_REQ_NOTIFICATION_TYPE,
   FriendReqStatus,
} from '@domain/entities/FriendReqNotification.entity';
import mongoose, { Document } from 'mongoose';

// ---------------------base notification with desciminator------------------
interface IBaseNotificationDocument extends Document {
   id: string;
   reciverId: string;
   createdAt: Date;
   updatedAt: Date;
   isRead: boolean;
}

const baseNotificationSchema = new mongoose.Schema<IBaseNotificationDocument>(
   {
      isRead: { type: Boolean, default: false },
      reciverId: { type: String, required: true },
   },
   { discriminatorKey: 'type', timestamps: true }
);

baseNotificationSchema.index({ reciverId: 1 }, { unique: false });

const notificationModel = mongoose.model<IBaseNotificationDocument>(
   'notification',
   baseNotificationSchema
);
// ------------------ friend req descriminator----------------------------
interface IFriendRequestNotificationDocument extends IBaseNotificationDocument {
   friendshipId: string;
   requesterId: string;
   status: FriendReqStatus;
}

notificationModel.discriminator(
   FRIEND_REQ_NOTIFICATION_TYPE,
   new mongoose.Schema<IFriendRequestNotificationDocument>({
      friendshipId: { type: String, required: true },
      requesterId: { type: String, required: true },
      status: { type: String, enum: ['ACCEPTED', 'PENDING', 'DECLINED'] },
   })
);

//union of all documetts
export type INotificationDocument = IFriendRequestNotificationDocument;

export default notificationModel;
