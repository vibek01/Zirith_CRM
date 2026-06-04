import mongoose, { Schema, Document, Model } from 'mongoose';
import { DEAL_STAGES, DealStage } from '@/types';

export interface IDeal extends Document {
  companyName: string;
  website?: string;
  instagramLink?: string;
  linkedInUrl?: string;
  email?: string;
  contactName?: string;
  currentStage: DealStage;
  assignedOwnerId?: mongoose.Types.ObjectId;
  lastActivityDate: Date;
  createdAt: Date;
  notes: { text: string; createdAt: Date }[];
}

const DealSchema: Schema = new Schema({
  companyName: { type: String, required: true },
  website: { type: String },
  instagramLink: { type: String },
  linkedInUrl: { type: String },
  email: { type: String },
  contactName: { type: String },
  currentStage: { 
    type: String, 
    enum: DEAL_STAGES,
    default: 'prospecting' 
  },
  assignedOwnerId: { type: Schema.Types.ObjectId, ref: 'User' },
  lastActivityDate: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
  notes: [{
    text: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
  }],
});

export const Deal: Model<IDeal> = mongoose.models.Deal || mongoose.model<IDeal>('Deal', DealSchema);
