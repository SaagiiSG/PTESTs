import mongoose, { Schema, Document } from 'mongoose';

export interface ILesson {
  title: string;
  description: string;
  embedCode: string;
  video?: string;
}

export interface ICourse extends Document {
  title: string;
  description: string;
  price: number;
  thumbnailUrl?: string;
  lessons: ILesson[];
  createdAt?: Date;
  updatedAt?: Date;
}

const LessonSchema: Schema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  embedCode: { type: String, required: true },
  video: { type: String },
});

const CourseSchema: Schema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  thumbnailUrl: { type: String },
  lessons: { type: [LessonSchema], default: [] },
}, { timestamps: true });

export default mongoose.models.Course || mongoose.model<ICourse>('Course', CourseSchema); 