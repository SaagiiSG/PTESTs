const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI);

// Define the schema manually to avoid TypeScript import issues
const LessonSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  embedCode: { type: String, required: true },
  video: { type: String },
});

const CourseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  thumbnailUrl: { type: String },
  lessons: { type: [LessonSchema], default: [] },
}, { timestamps: true });

const Course = mongoose.models.Course || mongoose.model('Course', CourseSchema);

async function testVideoEmbed() {
  try {
    console.log('🎬 Testing Video Embed Functionality...\n');

    // Test embed codes
    const testEmbedCodes = {
      youtube: '<iframe width="100%" height="100%" src="https://www.youtube.com/embed/dQw4w9WgXcQ" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>',
      vimeo: '<iframe src="https://player.vimeo.com/video/148751763?h=1f6f3c8c5c" width="100%" height="100%" frameborder="0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>',
      responsive: '<div style="padding:56.25% 0 0 0;position:relative;"><iframe src="https://player.vimeo.com/video/824804225?badge=0&amp;autopause=0&amp;player_id=0&amp;app_id=58479" frameborder="0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen style="position:absolute;top:0;left:0;width:100%;height:100%;" title="Sample Video"></iframe></div>',
      directUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4'
    };

    // Create a test course with different video types
    const testCourse = new Course({
      title: 'Video Test Course',
      description: 'A test course to verify video embed functionality',
      price: 0,
      lessons: [
        {
          title: 'YouTube Video Lesson',
          description: 'Testing YouTube embed code',
          embedCode: testEmbedCodes.youtube,
          video: testEmbedCodes.youtube // This will be treated as embed code since it doesn't start with 'http'
        },
        {
          title: 'Vimeo Video Lesson',
          description: 'Testing Vimeo embed code',
          embedCode: testEmbedCodes.vimeo,
          video: testEmbedCodes.vimeo
        },
        {
          title: 'Responsive Video Lesson',
          description: 'Testing responsive embed code',
          embedCode: testEmbedCodes.responsive,
          video: testEmbedCodes.responsive
        },
        {
          title: 'Direct URL Video Lesson',
          description: 'Testing direct video URL',
          embedCode: '<p>Test content for direct URL lesson</p>',
          video: testEmbedCodes.directUrl // This will be treated as direct video since it starts with 'http'
        }
      ]
    });

    // Save the test course
    const savedCourse = await testCourse.save();
    console.log('✅ Test course created successfully!');
    console.log(`📝 Course ID: ${savedCourse._id}`);
    console.log(`📚 Number of lessons: ${savedCourse.lessons.length}\n`);

    // Test the video detection logic
    console.log('🔍 Testing Video Detection Logic:');
    savedCourse.lessons.forEach((lesson, index) => {
      console.log(`\n📖 Lesson ${index + 1}: ${lesson.title}`);
      console.log(`   Video field: ${lesson.video ? 'Present' : 'Not present'}`);
      
      if (lesson.video) {
        const isDirectUrl = lesson.video.startsWith('http');
        console.log(`   Type: ${isDirectUrl ? 'Direct URL (HTML5 Video)' : 'Embed Code (iframe/div)'}`);
        console.log(`   Starts with 'http': ${isDirectUrl}`);
        
        if (isDirectUrl) {
          console.log(`   ✅ Will use HTML5 video player with custom controls`);
        } else {
          console.log(`   ✅ Will use dangerouslySetInnerHTML for embed code`);
        }
      } else {
        console.log(`   ⚠️  No video field present`);
      }
    });

    console.log('\n🎯 Test URLs:');
    console.log(`📺 Course page: http://localhost:3000/Course/${savedCourse._id}`);
    console.log(`📹 Lesson 1 (YouTube): http://localhost:3000/Course/${savedCourse._id}/lesson/0`);
    console.log(`📹 Lesson 2 (Vimeo): http://localhost:3000/Course/${savedCourse._id}/lesson/1`);
    console.log(`📹 Lesson 3 (Responsive): http://localhost:3000/Course/${savedCourse._id}/lesson/2`);
    console.log(`📹 Lesson 4 (Direct URL): http://localhost:3000/Course/${savedCourse._id}/lesson/3`);
    console.log(`🧪 Video test page: http://localhost:3000/test-video`);

    console.log('\n✨ Test completed successfully!');
    console.log('💡 You can now visit the test URLs to see the video functionality in action.');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run the test
testVideoEmbed(); 