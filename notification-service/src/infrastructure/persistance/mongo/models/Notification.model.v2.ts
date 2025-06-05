import { CombinedNotificationType } from '@domain/entities/CombinedNotification';
import { FRIEND_REQ_ACCEPTED_NOTIFICATION_TYPE } from '@domain/entities/FriendReqAcceptedNotification.entity';
import {
   FRIEND_REQ_NOTIFICATION_TYPE,
   FriendReqStatus,
} from '@domain/entities/FriendReqNotification.entity';
import mongoose, { Document, HydratedDocument, Schema } from 'mongoose';

// --------------------- Base Notification -------------------
interface IBaseNotificationDocument extends Document {
   reciverId: string;
   isRead: boolean;
   type: (typeof CombinedNotificationType)[keyof typeof CombinedNotificationType]; // add type for discriminator
   entityId: string;
   actorId?: string; // from where notification originatioed
   updatedAt: Date;
   createdAt: Date;
   metadata: {};
}

const baseNotificationSchema = new mongoose.Schema<IBaseNotificationDocument>(
   {
      reciverId: { type: String, required: true },
      isRead: { type: Boolean, default: false },
      type: { type: String, enum: Object.values(CombinedNotificationType), required: true }, // Add to schema
      entityId: { type: String, required: true },
      actorId: { type: String },
      metadata: { type: Schema.Types.Mixed, default: {} },
   },
   { discriminatorKey: 'type', timestamps: true }
);

baseNotificationSchema.index({ reciverId: 1, _id: -1 }, { unique: false });

const notificationModel = mongoose.model<IBaseNotificationDocument>(
   'notification',
   baseNotificationSchema
);

// --------------- friend Request Discriminator --------------------
interface IFriendRequestNotificationDocument extends IBaseNotificationDocument {
   actorId: string;
   metadata: { reqStatus: (typeof FriendReqStatus)[keyof typeof FriendReqStatus] };
   type: typeof FRIEND_REQ_NOTIFICATION_TYPE; // ensure type discriminator is included
}

const friendReqSchema = new mongoose.Schema<IFriendRequestNotificationDocument>(
   {
      actorId: { type: String, required: true },
      metadata: {
         reqStatus: {
            type: String,
            required: true,
            enum: Object.values(FriendReqStatus),
         },
      },
   },
   { discriminatorKey: 'type' }
);

const friendReqNotificationModel =
   notificationModel.discriminator<IFriendRequestNotificationDocument>(
      FRIEND_REQ_NOTIFICATION_TYPE,
      friendReqSchema
   );

// --------------- friend Request Acepted Discriminator --------------------
interface IFriendRequestAcceptedNotificationDocument extends IBaseNotificationDocument {
   actorId: string;
   metadata: { reqStatus: 'ACCEPTED' };
   type: typeof FRIEND_REQ_ACCEPTED_NOTIFICATION_TYPE; // ensure type discriminator is included
}

const friendReqAcceptedSchema = new mongoose.Schema<IFriendRequestAcceptedNotificationDocument>(
   {
      actorId: { type: String, required: true },
      metadata: {
         reqStatus: {
            type: String,
            required: true,
            enum: ['ACCEPTED'],
         },
      },
   },
   { discriminatorKey: 'type' }
);

const friendReqAcceptedNotificationModel =
   notificationModel.discriminator<IFriendRequestAcceptedNotificationDocument>(
      FRIEND_REQ_ACCEPTED_NOTIFICATION_TYPE,
      friendReqAcceptedSchema
   );

// ------------------ Type for Friend Request Documents --------------------
export type FriendReqNotificationDocument = HydratedDocument<IFriendRequestNotificationDocument>;
export type FriendReqAcceptedNotificationDocument =
   HydratedDocument<IFriendRequestAcceptedNotificationDocument>;

export type INotificationDocument =
   | IFriendRequestNotificationDocument
   | IFriendRequestAcceptedNotificationDocument;

// ------m-----odelss------------
export { friendReqNotificationModel, friendReqAcceptedNotificationModel };
export default notificationModel;
