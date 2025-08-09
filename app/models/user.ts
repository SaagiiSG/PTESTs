import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  phoneNumber: string;
  password: string;
  email?: string;
  age?: number;
  gender?: string;
  dateOfBirth?: Date;
  education?: string;
  family?: string;
  position?: string;
  verificationCode?: string;
  isPhoneVerified?: boolean;
  verificationCodeExpires?: Date;
  isEmailVerified?: boolean;
  emailVerificationToken?: string;
  emailVerificationExpires?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  passwordResetCode?: string;
  isAdmin?: boolean;
  purchasedCourses?: mongoose.Types.ObjectId[];
  purchasedTests?: mongoose.Types.ObjectId[];
}

const UserSchema: Schema = new Schema({
  name: { type: String, required: true },
  phoneNumber: { type: String, required: false, unique: true, sparse: true },
  password: { type: String, required: false },
  email: { type: String, required: false, unique: true, sparse: true },
  age: { type: Number },
  gender: { type: String },
  dateOfBirth: { type: Date },
  education: { type: String },
  family: { type: String },
  position: { type: String },
  verificationCode: { type: String },
  isPhoneVerified: { type: Boolean, default: false },
  verificationCodeExpires: { type: Date },
  isEmailVerified: { type: Boolean, default: false },
  emailVerificationToken: { type: String },
  emailVerificationExpires: { type: Date },
  passwordResetToken: { type: String },
  passwordResetExpires: { type: Date },
  passwordResetCode: { type: String },
  isAdmin: { type: Boolean, default: false },
  purchasedCourses: { type: [{ type: Schema.Types.ObjectId, ref: 'Course' }], default: [] },
  purchasedTests: { type: [{ type: Schema.Types.ObjectId, ref: 'Test' }], default: [] },
}, { timestamps: true });

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
