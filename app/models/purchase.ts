import mongoose, { Schema, Document } from 'mongoose';

export interface IPurchase extends Document {
  user: mongoose.Types.ObjectId;
  course?: mongoose.Types.ObjectId;
  test?: mongoose.Types.ObjectId;
  purchasedAt: Date;
}

const PurchaseSchema: Schema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  course: { type: Schema.Types.ObjectId, ref: 'Course' },
  test: { type: Schema.Types.ObjectId, ref: 'Test' },
  purchasedAt: { type: Date, default: Date.now },
});

export default mongoose.models.Purchase || mongoose.model<IPurchase>('Purchase', PurchaseSchema); 