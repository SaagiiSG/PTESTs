import mongoose, { Schema, Document } from 'mongoose';

export interface ITest extends Document {
  title: {
    mn: string;
    en: string;
  };
  description: {
    mn: string;
    en: string;
  };
  testType: 'Talent' | 'Aptitude' | 'Clinic' | 'Personality';
  embedCode: string;
  takenCount?: number;
  price: number;
  thumbnailUrl?: string;
  isActive?: boolean;
  duration?: number; // in minutes
  questions?: Array<{
    question: string;
    options?: string[];
    correctAnswer?: string;
    type?: 'multiple-choice' | 'text' | 'number';
  }>;
  createdAt?: Date;
  updatedAt?: Date;
  uniqueCodes?: Array<{
    code: string;
    assignedTo?: mongoose.Types.ObjectId;
    assignedAt?: Date;
    used?: boolean;
    usedAt?: Date;
  }>;
}

const TestSchema: Schema = new Schema({
  title: {
    mn: { 
      type: String, 
      required: true, 
      trim: true,
      minlength: [1, 'Mongolian title cannot be empty']
    },
    en: { 
      type: String, 
      required: true, 
      trim: true,
      minlength: [1, 'English title cannot be empty']
    },
  },
  description: {
    mn: { 
      type: String, 
      required: true, 
      trim: true,
      minlength: [1, 'Mongolian description cannot be empty']
    },
    en: { 
      type: String, 
      required: true, 
      trim: true,
      minlength: [1, 'English description cannot be empty']
    },
  },
  testType: { 
    type: String, 
    required: true, 
    enum: ['Talent', 'Aptitude', 'Clinic', 'Personality'],
    default: 'Talent',
    index: true
  },
  embedCode: { 
    type: String, 
    required: true,
    trim: true
  },
  takenCount: { 
    type: Number, 
    default: 0,
    min: [0, 'Taken count cannot be negative']
  },
  price: { 
    type: Number, 
    required: true,
    min: [0, 'Price cannot be negative']
  },
  thumbnailUrl: { 
    type: String, 
    required: false,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  duration: {
    type: Number,
    min: [1, 'Duration must be at least 1 minute'],
    default: 30
  },
  questions: [
    {
      question: { type: String, required: true },
      options: [{ type: String }],
      correctAnswer: { type: String },
      type: { 
        type: String, 
        enum: ['multiple-choice', 'text', 'number'],
        default: 'multiple-choice'
      }
    }
  ],
  uniqueCodes: [
    {
      code: { 
        type: String, 
        required: false,
        trim: true,
        unique: true,
        sparse: true
      },
      assignedTo: { 
        type: Schema.Types.ObjectId, 
        ref: 'User' 
      },
      assignedAt: { 
        type: Date,
        default: Date.now
      },
      used: { 
        type: Boolean, 
        default: false 
      },
      usedAt: { 
        type: Date 
      }
    },
  ],
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
TestSchema.index({ 'title.en': 'text', 'title.mn': 'text', 'description.en': 'text', 'description.mn': 'text' });
TestSchema.index({ createdAt: -1 });
TestSchema.index({ price: 1 });
TestSchema.index({ takenCount: -1 });

// Virtual for getting localized title based on language
TestSchema.virtual('localizedTitle').get(function() {
  return this.title;
});

// Virtual for getting localized description based on language
TestSchema.virtual('localizedDescription').get(function() {
  return this.description;
});

// Method to get title in specific language
TestSchema.methods.getTitle = function(language: 'en' | 'mn' = 'en') {
  return this.title[language] || this.title.en || this.title.mn || 'Untitled';
};

// Method to get description in specific language
TestSchema.methods.getDescription = function(language: 'en' | 'mn' = 'en') {
  return this.description[language] || this.description.en || this.description.mn || 'No description available';
};

// Pre-save middleware to ensure both languages are provided
TestSchema.pre('save', function(next) {
  if (!this.title.en || !this.title.mn) {
    return next(new Error('Both English and Mongolian titles are required'));
  }
  if (!this.description.en || !this.description.mn) {
    return next(new Error('Both English and Mongolian descriptions are required'));
  }
  next();
});

export default mongoose.models.Test || mongoose.model<ITest>('Test', TestSchema);
