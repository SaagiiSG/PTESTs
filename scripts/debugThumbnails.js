// Debug script for thumbnail issues
const fs = require('fs');
const path = require('path');

console.log('🔍 Debugging Thumbnail Issues...\n');

// Check 1: Public directory and uploaded files
const publicDir = path.join(__dirname, '../public');
console.log('📁 Checking public directory...');
if (fs.existsSync(publicDir)) {
  const files = fs.readdirSync(publicDir);
  const thumbnailFiles = files.filter(file => file.startsWith('thumbnail_'));
  console.log(`✅ Public directory exists`);
  console.log(`📸 Found ${thumbnailFiles.length} thumbnail files:`);
  thumbnailFiles.forEach(file => {
    const filePath = path.join(publicDir, file);
    const stats = fs.statSync(filePath);
    console.log(`   - ${file} (${(stats.size / 1024).toFixed(1)}KB)`);
  });
} else {
  console.log('❌ Public directory missing');
}

// Check 2: Course creation form
const courseFormPath = path.join(__dirname, '../app/admin/create-course/CreateCourseForm.tsx');
console.log('\n📝 Checking course creation form...');
if (fs.existsSync(courseFormPath)) {
  const content = fs.readFileSync(courseFormPath, 'utf8');
  if (content.includes('upload-thumbnail')) {
    console.log('✅ Course form has thumbnail upload');
  } else {
    console.log('❌ Course form missing thumbnail upload');
  }
  if (content.includes('thumbnailUrl')) {
    console.log('✅ Course form saves thumbnailUrl');
  } else {
    console.log('❌ Course form missing thumbnailUrl field');
  }
} else {
  console.log('❌ Course creation form missing');
}

// Check 3: Course model
const courseModelPath = path.join(__dirname, '../app/models/course.ts');
console.log('\n🗄️ Checking course model...');
if (fs.existsSync(courseModelPath)) {
  const content = fs.readFileSync(courseModelPath, 'utf8');
  if (content.includes('thumbnailUrl')) {
    console.log('✅ Course model has thumbnailUrl field');
  } else {
    console.log('❌ Course model missing thumbnailUrl field');
  }
} else {
  console.log('❌ Course model missing');
}

// Check 4: Course API
const courseApiPath = path.join(__dirname, '../app/api/courses/route.ts');
console.log('\n🔌 Checking course API...');
if (fs.existsSync(courseApiPath)) {
  const content = fs.readFileSync(courseApiPath, 'utf8');
  if (content.includes('thumbnailUrl')) {
    console.log('✅ Course API handles thumbnailUrl');
  } else {
    console.log('❌ Course API missing thumbnailUrl handling');
  }
} else {
  console.log('❌ Course API missing');
}

// Check 5: CourseCard component
const courseCardPath = path.join(__dirname, '../components/home/CourseCard.tsx');
console.log('\n🎴 Checking CourseCard component...');
if (fs.existsSync(courseCardPath)) {
  const content = fs.readFileSync(courseCardPath, 'utf8');
  if (content.includes('thumbnailUrl')) {
    console.log('✅ CourseCard uses thumbnailUrl');
  } else {
    console.log('❌ CourseCard missing thumbnailUrl');
  }
  if (content.includes('img') || content.includes('Image')) {
    console.log('✅ CourseCard has image rendering');
  } else {
    console.log('❌ CourseCard missing image rendering');
  }
} else {
  console.log('❌ CourseCard component missing');
}

// Check 6: Next.js config
const nextConfigPath = path.join(__dirname, '../next.config.ts');
console.log('\n⚙️ Checking Next.js config...');
if (fs.existsSync(nextConfigPath)) {
  const content = fs.readFileSync(nextConfigPath, 'utf8');
  if (content.includes('images')) {
    console.log('✅ Next.js has image configuration');
  } else {
    console.log('❌ Next.js missing image configuration');
  }
  if (content.includes('unoptimized')) {
    console.log('✅ Next.js has unoptimized images enabled');
  } else {
    console.log('❌ Next.js missing unoptimized images setting');
  }
} else {
  console.log('❌ Next.js config missing');
}

console.log('\n🎯 Troubleshooting Steps:');
console.log('1. Check browser console for image loading errors');
console.log('2. Verify thumbnail files exist in /public directory');
console.log('3. Check if thumbnailUrl is saved in database');
console.log('4. Ensure image paths are correct (should start with /)');
console.log('5. Try accessing thumbnail directly: http://localhost:3000/thumbnail_filename.jpg'); 