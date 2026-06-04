import mongoose, { Schema, Document } from 'mongoose';

export interface ILeadAssignmentState extends Document {
  type: string;
  currentIndex: number;
}

const LeadAssignmentStateSchema: Schema = new Schema(
  {
    type: { type: String, required: true, unique: true },
    currentIndex: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const LeadAssignmentState = mongoose.models.LeadAssignmentState || mongoose.model<ILeadAssignmentState>('LeadAssignmentState', LeadAssignmentStateSchema);
