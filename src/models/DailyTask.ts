import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IDailyTask extends Document {
  userId: mongoose.Types.ObjectId;
  dealId?: mongoose.Types.ObjectId;
  taskDescription: string;
  taskType: string;
  isCompleted: boolean;
  dueDate: Date;
  createdAt: Date;
}

const DailyTaskSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  dealId: { type: Schema.Types.ObjectId, ref: 'Deal' },
  taskDescription: { type: String, required: true },
  taskType: { type: String, required: true },
  isCompleted: { type: Boolean, default: false },
  dueDate: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
});

export const DailyTask: Model<IDailyTask> = mongoose.models.DailyTask || mongoose.model<IDailyTask>('DailyTask', DailyTaskSchema);
