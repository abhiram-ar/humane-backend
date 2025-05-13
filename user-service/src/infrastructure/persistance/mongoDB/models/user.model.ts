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
   lastLoginTime?: string;
   createdAt: string;
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
      passwordHash: { type: String },
      bio: { type: String, default: '' },
      lastLoginTime: { type: String, default: new Date().toISOString() },
   },
   { timestamps: true }
);

userSchema.index({ email: 1 }, { unique: true });

const userModel = mongoose.model('user', userSchema);
export default userModel;
