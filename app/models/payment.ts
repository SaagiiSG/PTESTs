import mongoose, { Schema, Document } from 'mongoose';

export interface IPayment extends Document {
  payment_id: string;
  payment_date: string;
  payment_status: 'NEW' | 'FAILED' | 'PAID' | 'REFUNDED';
  payment_fee: number;
  payment_amount: number;
  payment_currency: string;
  payment_wallet: string;
  payment_name: string;
  payment_description: string;
  qr_code: string;
  paid_by: 'P2P' | 'CARD';
  object_type: string;
  object_id: string; // This is the invoice ID
  user?: mongoose.Types.ObjectId;
  course?: mongoose.Types.ObjectId;
  test?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema: Schema = new Schema({
  payment_id: { type: String, required: true, unique: true },
  payment_date: { type: String, required: true },
  payment_status: { 
    type: String, 
    required: true, 
    enum: ['NEW', 'FAILED', 'PAID', 'REFUNDED'],
    default: 'NEW'
  },
  payment_fee: { type: Number, default: 0 },
  payment_amount: { type: Number, required: true },
  payment_currency: { type: String, default: 'MNT' },
  payment_wallet: { type: String, default: 'QPay' },
  payment_name: { type: String },
  payment_description: { type: String },
  qr_code: { type: String },
  paid_by: { 
    type: String, 
    enum: ['P2P', 'CARD'],
    default: 'P2P'
  },
  object_type: { type: String, required: true },
  object_id: { type: String, required: true }, // Invoice ID
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  course: { type: Schema.Types.ObjectId, ref: 'Course' },
  test: { type: Schema.Types.ObjectId, ref: 'Test' },
}, {
  timestamps: true
});

// Index for fast lookups
PaymentSchema.index({ object_id: 1 });
PaymentSchema.index({ payment_id: 1 });
PaymentSchema.index({ payment_status: 1 });
PaymentSchema.index({ createdAt: -1 });

export default mongoose.models.Payment || mongoose.model<IPayment>('Payment', PaymentSchema); 