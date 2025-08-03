const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ptest';

// Test Schema (simplified)
const testSchema = new mongoose.Schema({
  title: String,
  description: {
    mn: String,
    en: String
  },
  testType: String,
  embedCode: String,
  price: Number,
  thumbnailUrl: String,
  uniqueCodes: Array,
  createdAt: Date,
  updatedAt: Date
});

// Course Schema (simplified)
const courseSchema = new mongoose.Schema({
  title: String,
  description: String,
  price: Number,
  thumbnailUrl: String,
  lessons: Array,
  createdAt: Date,
  updatedAt: Date
});

const Test = mongoose.model('Test', testSchema);
const Course = mongoose.model('Course', courseSchema);

// Function to get all thumbnail files from public directory
function getThumbnailFiles() {
  const publicDir = path.join(__dirname, '../public');
  const files = fs.readdirSync(publicDir);
  
  return files.filter(file => {
    const ext = path.extname(file).toLowerCase();
    return file.startsWith('thumbnail_') && ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext);
  }).map(file => ({
    filename: file,
    path: `/public/${file}`,
    url: `/${file}`
  }));
}

// Function to update database records with thumbnails
async function updateThumbnailsDirect() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    console.log('🔍 Finding thumbnail files...');
    const thumbnails = getThumbnailFiles();
    console.log(`📁 Found ${thumbnails.length} thumbnail files:`, thumbnails.map(t => t.filename));

    if (thumbnails.length === 0) {
      console.log('❌ No thumbnail files found');
      return;
    }

    // Update tests
    console.log('\n📊 Updating tests...');
    const tests = await Test.find({});
    console.log(`📋 Found ${tests.length} tests`);
    
    for (let i = 0; i < Math.min(tests.length, thumbnails.length); i++) {
      const test = tests[i];
      const thumbnail = thumbnails[i];
      
      if (!test.thumbnailUrl || test.thumbnailUrl === '') {
        console.log(`🔄 Updating test "${test.title}" with thumbnail: ${thumbnail.filename}`);
        
        try {
          await Test.findByIdAndUpdate(test._id, { thumbnailUrl: thumbnail.url });
          console.log(`✅ Updated test: ${test.title}`);
        } catch (error) {
          console.log(`❌ Failed to update test: ${test.title}`, error.message);
        }
      } else {
        console.log(`⏭️  Test "${test.title}" already has thumbnail: ${test.thumbnailUrl}`);
      }
    }

    // Update courses
    console.log('\n📚 Updating courses...');
    const courses = await Course.find({});
    console.log(`📋 Found ${courses.length} courses`);
    
    for (let i = 0; i < Math.min(courses.length, thumbnails.length); i++) {
      const course = courses[i];
      const thumbnail = thumbnails[i];
      
      if (!course.thumbnailUrl || course.thumbnailUrl === '') {
        console.log(`🔄 Updating course "${course.title}" with thumbnail: ${thumbnail.filename}`);
        
        try {
          await Course.findByIdAndUpdate(course._id, { thumbnailUrl: thumbnail.url });
          console.log(`✅ Updated course: ${course.title}`);
        } catch (error) {
          console.log(`❌ Failed to update course: ${course.title}`, error.message);
        }
      } else {
        console.log(`⏭️  Course "${course.title}" already has thumbnail: ${course.thumbnailUrl}`);
      }
    }

    console.log('\n🎉 Thumbnail update completed!');
    
  } catch (error) {
    console.error('❌ Error updating thumbnails:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the update
updateThumbnailsDirect(); 