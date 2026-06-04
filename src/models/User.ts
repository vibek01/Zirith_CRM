import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  whatsappNumber?: string;
  role: string;
  createdAt: Date;
}

const UserSchema: Schema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  whatsappNumber: { type: String },
  role: { type: String, default: 'member' },
  createdAt: { type: Date, default: Date.now },
});

export const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
