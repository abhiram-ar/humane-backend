import { CombinedNotificationType } from '@domain/entities/CombinedNotification';
import { FRIEND_REQ_ACCEPTED_NOTIFICATION_TYPE } from '@domain/entities/FriendReqAcceptedNotification.entity';
import {
   FRIEND_REQ_NOTIFICATION_TYPE,
   FriendReqStatus,
} from '@domain/entities/FriendReqNotification.entity';
import { POST_GOT_COMMNET_NOTIFICATION_TYPE } from '@domain/entities/PostGotCommnetNotification';
import mongoose, { Document, Schema } from 'mongoose';

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
export interface IFriendRequestNotificationDocument extends IBaseNotificationDocument {
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
export interface IFriendRequestAcceptedNotificationDocument extends IBaseNotificationDocument {
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

// ---------------------- POST-got-commented distriminator ------------------
export interface IPostGotCommnetNotificationDocument extends IBaseNotificationDocument {
   actorId: string;
   metadata: { postId: string; commentContent: string };
   type: typeof POST_GOT_COMMNET_NOTIFICATION_TYPE; // ensure type discriminator is included
}

const postGotCommentNotificationSchema = new mongoose.Schema<IPostGotCommnetNotificationDocument>(
   {
      actorId: { type: String, required: true },
      metadata: {
         postId: {
            type: String,
            required: true,
         },
         commentContent: {
            type: String,
            required: true,
         },
      },
   },
   { discriminatorKey: 'type' }
);
postGotCommentNotificationSchema.index({ entityId: 1, 'metadata.postId': 1 }, { unique: true });

const postGotCommnetNotificationModel =
   notificationModel.discriminator<IPostGotCommnetNotificationDocument>(
      POST_GOT_COMMNET_NOTIFICATION_TYPE,
      postGotCommentNotificationSchema
   );

// ------------------ Combined notifcation Documents --------------------
export type INotificationDocument =
   | IFriendRequestNotificationDocument
   | IFriendRequestAcceptedNotificationDocument
   | IPostGotCommnetNotificationDocument;

// ----------------------------models-======================-----------
export {
   friendReqNotificationModel,
   friendReqAcceptedNotificationModel,
   postGotCommnetNotificationModel,
};
export default notificationModel;
