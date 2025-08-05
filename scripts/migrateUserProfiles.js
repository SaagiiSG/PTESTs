require('dotenv').config({ path: '.env' });
const mongoose = require('mongoose');

// Connect to MongoDB
const connectDB = async () => {
  try {
    console.log('MongoDB URI:', process.env.MONGODB_URI ? 'Found' : 'Not found');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// User Schema (copy from the model)
const UserSchema = new mongoose.Schema({
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
  isAdmin: { type: Boolean, default: false },
  purchasedCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
  purchasedTests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Test' }],
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', UserSchema);

// Migration function
const migrateUserProfiles = async () => {
  try {
    console.log('Starting user profile migration...');
    
    // Find users who are missing any of the new required fields
    const usersToMigrate = await User.find({
      $or: [
        { dateOfBirth: { $exists: false } },
        { dateOfBirth: null },
        { education: { $exists: false } },
        { education: null },
        { family: { $exists: false } },
        { family: null },
        { position: { $exists: false } },
        { position: null }
      ]
    });

    console.log(`Found ${usersToMigrate.length} users to migrate`);

    for (const user of usersToMigrate) {
      console.log(`Migrating user: ${user.name} (${user.email})`);
      
      const updates = {};

      // Convert age to approximate dateOfBirth if age exists
      if (!user.dateOfBirth && user.age) {
        const currentYear = new Date().getFullYear();
        const birthYear = currentYear - user.age;
        // Set to January 1st of the birth year as an approximation
        updates.dateOfBirth = new Date(birthYear, 0, 1);
        console.log(`  - Converted age ${user.age} to dateOfBirth: ${updates.dateOfBirth}`);
      } else if (!user.dateOfBirth) {
        // Set a default dateOfBirth (January 1, 2000) if no age is available
        updates.dateOfBirth = new Date(2000, 0, 1);
        console.log(`  - Set default dateOfBirth: ${updates.dateOfBirth}`);
      }

      // Set default values for new required fields if they don't exist
      if (!user.education) {
        updates.education = 'Other';
        console.log(`  - Set default education: Other`);
      }

      if (!user.family) {
        updates.family = 'Other';
        console.log(`  - Set default family status: Other`);
      }

      if (!user.position) {
        updates.position = 'Student';
        console.log(`  - Set default position: Student`);
      }

      // Update the user
      await User.findByIdAndUpdate(user._id, updates);
      console.log(`  - User ${user.name} migrated successfully`);
    }

    console.log('Migration completed successfully!');
    
    // Verify migration
    const migratedUsers = await User.find({
      dateOfBirth: { $exists: true, $ne: null },
      education: { $exists: true, $ne: null },
      family: { $exists: true, $ne: null },
      position: { $exists: true, $ne: null }
    });

    console.log(`Total users with complete profiles: ${migratedUsers.length}`);

  } catch (error) {
    console.error('Migration error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB disconnected');
  }
};

// Run migration
if (require.main === module) {
  connectDB().then(() => {
    migrateUserProfiles();
  });
}

module.exports = { migrateUserProfiles }; 