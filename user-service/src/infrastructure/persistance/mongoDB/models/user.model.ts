import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
   id: string;
   firstName: string;
   email: string;
   isEmailVerified: boolean;
   isBlocked: boolean;
   humaneScore: number;
   isHotUser: boolean;
   avatar?: string;
   coverPhoto?: string;
   lastName?: string;
   passwordHash?: string;
   bio?: string;
   lastLoginTime?: Date;
   createdAt?: Date;
}

const userSchema = new Schema<IUser>(
   {
      firstName: { type: String, required: true },
      lastName: { type: String },
      email: { type: String, required: true },
      isEmailVerified: { type: Boolean, default: false },
      isBlocked: { type: Boolean, default: false },
      humaneScore: { type: Number, default: 0 },
      isHotUser: { type: Boolean, default: false },
      avatar: { type: String },
      coverPhoto: { type: String },
      passwordHash: { type: String, required: true },
      bio: { type: String },
      lastLoginTime: { type: Date, default: Date.now() },
   },
   { timestamps: true }
);

const userModel = mongoose.model('user', userSchema);
export default userModel;
