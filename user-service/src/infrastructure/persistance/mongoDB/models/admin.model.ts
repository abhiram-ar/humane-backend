import mongoose, { Document } from 'mongoose';

interface IAdmin extends Document {
   email: string;
   firstName: string;
   lastName?: string;
   passwordHash: string;
}

const adminSchema = new mongoose.Schema<IAdmin>({
   email: { type: String, required: true },
   firstName: { type: String, required: true },
   lastName: { type: String },
   passwordHash: { type: String, required: true },
});

adminSchema.index({ email: 1 }, { unique: true });

export const adminModel = mongoose.model<IAdmin>('admin', adminSchema);
