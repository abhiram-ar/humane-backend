import mongoose, { Document } from 'mongoose';

interface IAnonymousUserModel extends Document {
   anonId: string;
   userId: string;
   revoked: boolean;
   expiresAt: number;
   createdAt: number;
}

const anonymousUserSchema = new mongoose.Schema<IAnonymousUserModel>({
   userId: { type: String, required: true },
   anonId: { type: String, required: true },
   revoked: { type: Boolean, default: false },
   expiresAt: { type: Number, required: true },
   createdAt: { type: Number, required: true },
});

anonymousUserSchema.index({ anonId: 1 }, { unique: true });
const anoymousUserModel = mongoose.model<IAnonymousUserModel>('anonymous', anonymousUserSchema);

export default anoymousUserModel;
