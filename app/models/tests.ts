import mongoose, { Schema, Document } from 'mongoose';

export interface ITest extends Document {
  title: string;
  description: {
    mn: string;
    en: string;
  };
  embedCode: string;
  takenCount?: number;
  price: number;
  thumbnailUrl?: string;
  createdAt?: Date;
  updatedAt?: Date;
  uniqueCodes?: Array<{
    code: string;
    assignedTo?: mongoose.Types.ObjectId;
    assignedAt?: Date;
    used?: boolean;
  }>;
}

const TestSchema: Schema = new Schema({
  title: { type: String, required: true },
  description: {
    mn: { type: String, required: true },
    en: { type: String, required: true },
  },
  embedCode: { type: String, required: true },
  takenCount: { type: Number, default: 0 },
  price: { type: Number, required: true },
  thumbnailUrl: { type: String, required: false },
  uniqueCodes: [
    {
      code: { type: String, required: true },
      assignedTo: { type: Schema.Types.ObjectId, ref: 'User' },
      assignedAt: { type: Date },
      used: { type: Boolean, default: false },
    },
  ],
}, { timestamps: true });

export default mongoose.models.Test || mongoose.model<ITest>('Test', TestSchema);
