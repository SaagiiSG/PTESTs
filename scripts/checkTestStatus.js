const mongoose = require('mongoose');
require('dotenv').config();

async function checkSpecificTest() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const UserSchema = new mongoose.Schema({
      name: { type: String, required: true },
      phoneNumber: { type: String, required: false, unique: true, sparse: true },
      password: { type: String, required: false },
      email: { type: String, required: false, unique: true, sparse: true },
      age: { type: Number },
      gender: { type: String },
      verificationCode: { type: String },
      isPhoneVerified: { type: Boolean, default: false },
      verificationCodeExpires: { type: Date },
      isAdmin: { type: Boolean, default: false },
      purchasedCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
      purchasedTests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Test' }],
    }, { timestamps: true });

    const User = mongoose.models.User || mongoose.model('User', UserSchema);
    
    const user = await User.findById('687776d65331afc2ccff3d18').lean();
    
    const testId1 = '68839de157fba2e7fd7441a4';
    const testId2 = '688c71cbf25d376c79c099d9';
    
    const hasTest1 = user.purchasedTests.some(id => id.toString() === testId1);
    const hasTest2 = user.purchasedTests.some(id => id.toString() === testId2);
    
    console.log('\n=== Test Purchase Status ===');
    console.log(`Test 1 (${testId1}): ${hasTest1 ? 'PURCHASED' : 'NOT PURCHASED'}`);
    console.log(`Test 2 (${testId2}): ${hasTest2 ? 'PURCHASED' : 'NOT PURCHASED'}`);
    
    if (!hasTest2) {
      console.log('\n✅ Test 2 can be used for free enrollment testing!');
    } else {
      console.log('\n❌ Both free tests are already purchased. Need to create a new free test.');
    }
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
}

checkSpecificTest(); 