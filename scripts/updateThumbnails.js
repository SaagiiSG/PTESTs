const fs = require('fs');
const path = require('path');

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
async function updateThumbnails() {
  try {
    console.log('🔍 Finding thumbnail files...');
    const thumbnails = getThumbnailFiles();
    console.log(`📁 Found ${thumbnails.length} thumbnail files:`, thumbnails.map(t => t.filename));

    if (thumbnails.length === 0) {
      console.log('❌ No thumbnail files found');
      return;
    }

    // Update tests
    console.log('\n📊 Updating tests...');
    const testsResponse = await fetch('http://localhost:3001/api/tests');
    const tests = await testsResponse.json();
    
    for (let i = 0; i < Math.min(tests.length, thumbnails.length); i++) {
      const test = tests[i];
      const thumbnail = thumbnails[i];
      
      if (!test.thumbnailUrl || test.thumbnailUrl === '') {
        console.log(`🔄 Updating test "${test.title}" with thumbnail: ${thumbnail.filename}`);
        
        const updateResponse = await fetch(`http://localhost:3001/api/tests/${test._id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ thumbnailUrl: thumbnail.url })
        });
        
        if (updateResponse.ok) {
          console.log(`✅ Updated test: ${test.title}`);
        } else {
          console.log(`❌ Failed to update test: ${test.title}`);
        }
      }
    }

    // Update courses
    console.log('\n📚 Updating courses...');
    const coursesResponse = await fetch('http://localhost:3001/api/courses');
    const courses = await coursesResponse.json();
    
    for (let i = 0; i < Math.min(courses.length, thumbnails.length); i++) {
      const course = courses[i];
      const thumbnail = thumbnails[i];
      
      if (!course.thumbnailUrl || course.thumbnailUrl === '') {
        console.log(`🔄 Updating course "${course.title}" with thumbnail: ${thumbnail.filename}`);
        
        const updateResponse = await fetch(`http://localhost:3001/api/courses/${course._id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ thumbnailUrl: thumbnail.url })
        });
        
        if (updateResponse.ok) {
          console.log(`✅ Updated course: ${course.title}`);
        } else {
          console.log(`❌ Failed to update course: ${course.title}`);
        }
      }
    }

    console.log('\n🎉 Thumbnail update completed!');
    
  } catch (error) {
    console.error('❌ Error updating thumbnails:', error);
  }
}

// Run the update
updateThumbnails(); 