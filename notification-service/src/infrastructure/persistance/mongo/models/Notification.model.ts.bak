import {
   FRIEND_REQ_NOTIFICATION_TYPE,
   FriendReqStatus,
} from '@domain/entities/FriendReqNotification.entity';
import mongoose, { Document, HydratedDocument } from 'mongoose';

// --------------------- Base Notification -------------------
interface IBaseNotificationDocument extends Document {
   reciverId: string;
   createdAt: Date;
   updatedAt: Date;
   isRead: boolean;
   type: string; // add type for discriminator
}

const baseNotificationSchema = new mongoose.Schema<IBaseNotificationDocument>(
   {
      isRead: { type: Boolean, default: false },
      reciverId: { type: String, required: true },
      type: { type: String, required: true }, // Add to schema
   },
   { discriminatorKey: 'type', timestamps: true }
);

baseNotificationSchema.index({ reciverId: 1 }, { unique: false });

// Create base model with proper typing
const notificationModel = mongoose.model<IBaseNotificationDocument>(
   'notification',
   baseNotificationSchema
);

// --------------- friend Request Discriminator --------------------
interface IFriendRequestNotificationDocument extends IBaseNotificationDocument {
   friendshipId: string;
   requesterId: string;
   status: FriendReqStatus;
   type: typeof FRIEND_REQ_NOTIFICATION_TYPE; // ensure type discriminator is included
}

const friendReqSchema = new mongoose.Schema<IFriendRequestNotificationDocument>(
   {
      friendshipId: { type: String, required: true },
      requesterId: { type: String, required: true },
      status: {
         type: String,
         required: true,
         enum: ['ACCEPTED', 'PENDING', 'DECLINED'],
      },
   },
   { discriminatorKey: 'type' }
);

// typed discriminator model
const friendReqNotificationModel =
   notificationModel.discriminator<IFriendRequestNotificationDocument>(
      FRIEND_REQ_NOTIFICATION_TYPE,
      friendReqSchema
   );

friendReqNotificationModel.schema.index({ type: 1, friendshipId: 1 }, { unique: false });

// ------------------ Type for Friend Request Documents --------------------
export type FriendReqNotificationDocument = HydratedDocument<IFriendRequestNotificationDocument>;

//
export { friendReqNotificationModel };
export type INotificationDocument = IFriendRequestNotificationDocument;
export default notificationModel;
