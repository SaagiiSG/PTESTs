import mongoose, { Schema, Document } from 'mongoose';

export interface ILessonProgress {
  lessonIndex: number;
  completed: boolean;
  completedAt?: Date;
  timeSpent?: number; // in seconds
  testScore?: number;
}

export interface ICourseProgress {
  courseId: mongoose.Types.ObjectId;
  lessons: ILessonProgress[];
  startedAt: Date;
  completedAt?: Date;
  totalTimeSpent: number; // in seconds
  isCompleted: boolean;
  completionPercentage: number;
}

export interface IUserProgress extends Document {
  userId: mongoose.Types.ObjectId;
  courses: ICourseProgress[];
  totalCoursesCompleted: number;
  totalLessonsCompleted: number;
  achievements: string[];
  lastActivity: Date;
}

const LessonProgressSchema: Schema = new Schema({
  lessonIndex: { type: Number, required: true },
  completed: { type: Boolean, default: false },
  completedAt: { type: Date },
  timeSpent: { type: Number, default: 0 },
  testScore: { type: Number, min: 0, max: 100 },
});

const CourseProgressSchema: Schema = new Schema({
  courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
  lessons: { type: [LessonProgressSchema], default: [] },
  startedAt: { type: Date, default: Date.now },
  completedAt: { type: Date },
  totalTimeSpent: { type: Number, default: 0 },
  isCompleted: { type: Boolean, default: false },
  completionPercentage: { type: Number, default: 0, min: 0, max: 100 },
});

const UserProgressSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  courses: { type: [CourseProgressSchema], default: [] },
  totalCoursesCompleted: { type: Number, default: 0 },
  totalLessonsCompleted: { type: Number, default: 0 },
  achievements: { type: [String], default: [] },
  lastActivity: { type: Date, default: Date.now },
}, { timestamps: true });

// Index for efficient queries
UserProgressSchema.index({ userId: 1 });
UserProgressSchema.index({ 'courses.courseId': 1 });

export default mongoose.models.UserProgress || mongoose.model<IUserProgress>('UserProgress', UserProgressSchema);
