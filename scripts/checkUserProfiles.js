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

// Check user profiles
const checkUserProfiles = async () => {
  try {
    console.log('Checking user profiles...');
    
    // Get all users
    const allUsers = await User.find({});
    console.log(`Total users in database: ${allUsers.length}`);

    // Check each user's profile fields
    for (const user of allUsers) {
      console.log(`\nUser: ${user.name} (${user.email})`);
      console.log(`  - ID: ${user._id}`);
      console.log(`  - Age: ${user.age || 'Not set'}`);
      console.log(`  - Gender: ${user.gender || 'Not set'}`);
      console.log(`  - Date of Birth: ${user.dateOfBirth || 'Not set'}`);
      console.log(`  - Education: ${user.education || 'Not set'}`);
      console.log(`  - Family: ${user.family || 'Not set'}`);
      console.log(`  - Position: ${user.position || 'Not set'}`);
      
      // Check if profile is complete according to new system
      const hasNewFields = user.dateOfBirth && user.education && user.family && user.position;
      const hasOldFields = user.age && user.gender;
      
      console.log(`  - Has old fields (age, gender): ${hasOldFields ? 'Yes' : 'No'}`);
      console.log(`  - Has new fields (dateOfBirth, education, family, position): ${hasNewFields ? 'Yes' : 'No'}`);
      
      if (hasOldFields && !hasNewFields) {
        console.log(`  - ⚠️  NEEDS MIGRATION: Has old fields but missing new fields`);
      } else if (hasNewFields) {
        console.log(`  - ✅ COMPLETE: Has all new fields`);
      } else {
        console.log(`  - ❌ INCOMPLETE: Missing both old and new fields`);
      }
    }

    // Summary
    const usersWithOldFields = allUsers.filter(u => u.age && u.gender);
    const usersWithNewFields = allUsers.filter(u => u.dateOfBirth && u.education && u.family && u.position);
    const usersNeedingMigration = usersWithOldFields.filter(u => !u.dateOfBirth || !u.education || !u.family || !u.position);

    console.log(`\n=== SUMMARY ===`);
    console.log(`Total users: ${allUsers.length}`);
    console.log(`Users with old fields: ${usersWithOldFields.length}`);
    console.log(`Users with new fields: ${usersWithNewFields.length}`);
    console.log(`Users needing migration: ${usersNeedingMigration.length}`);

  } catch (error) {
    console.error('Error checking user profiles:', error);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB disconnected');
  }
};

// Run check
if (require.main === module) {
  connectDB().then(() => {
    checkUserProfiles();
  });
}

module.exports = { checkUserProfiles }; 