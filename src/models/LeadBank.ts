import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ILeadBank extends Document {
  companyName: string;
  contactName?: string;
  email?: string;
  linkedInUrl?: string;
  website?: string;
  instagramLink?: string;
  status: 'pending' | 'dispatched';
  rawData: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const LeadBankSchema: Schema = new Schema({
  companyName: { type: String, required: true },
  contactName: { type: String },
  email: { type: String },
  linkedInUrl: { type: String },
  website: { type: String },
  instagramLink: { type: String },
  status: { type: String, enum: ['pending', 'dispatched'], default: 'pending' },
  rawData: { type: Schema.Types.Mixed },
}, { timestamps: true });

export const LeadBank: Model<ILeadBank> = mongoose.models.LeadBank || mongoose.model<ILeadBank>('LeadBank', LeadBankSchema);
