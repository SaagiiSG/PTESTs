const mongoose = require('mongoose');

// Connect to MongoDB
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ptest');
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
}

// Add status field to existing courses
async function addStatusToCourses() {
  try {
    const Course = mongoose.model('Course', new mongoose.Schema({
      title: String,
      description: String,
      price: Number,
      thumbnailUrl: String,
      lessons: [{
        title: String,
        description: String,
        embedCode: String,
        video: String,
        testEmbedCode: String,
        estimatedDuration: Number
      }],
      status: { type: String, enum: ['active', 'inactive'], default: 'active' }
    }, { timestamps: true }));

    // Update all existing courses to have 'active' status
    const result = await Course.updateMany(
      { status: { $exists: false } },
      { $set: { status: 'active' } }
    );

    console.log(`✅ Updated ${result.modifiedCount} courses with 'active' status`);
    
    // Verify the update
    const courses = await Course.find({});
    console.log(`📊 Total courses: ${courses.length}`);
    console.log(`🟢 Active courses: ${courses.filter(c => c.status === 'active').length}`);
    console.log(`🔴 Inactive courses: ${courses.filter(c => c.status === 'inactive').length}`);
    
  } catch (error) {
    console.error('❌ Error updating courses:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the script
if (require.main === module) {
  connectDB().then(addStatusToCourses);
}

module.exports = { addStatusToCourses };
