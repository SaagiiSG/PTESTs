import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { connectMongoose } from '@/lib/mongodb';
import Course from '@/app/models/course';
import UserProgress from '@/app/models/userProgress';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectMongoose();

    // Get user's completed courses to understand their interests
    const userProgress = await UserProgress.findOne({ 
      userId: session.user.id 
    }).populate('courses.courseId');

    if (!userProgress) {
      // If no progress, return popular courses
      const popularCourses = await Course.find({ status: 'active' })
        .sort({ takenCount: -1 })
        .limit(6)
        .select('title description thumbnailUrl price lessons takenCount');
      
      return NextResponse.json({ recommendations: popularCourses });
    }

    // Get completed course categories/topics
    const completedCourses = userProgress.courses.filter(cp => cp.isCompleted);
    const completedCourseIds = completedCourses.map(cp => cp.courseId.toString());

    // Find courses in similar categories or related topics
    let recommendations = await Course.find({
      _id: { $nin: completedCourseIds },
      status: 'active'
    })
    .sort({ takenCount: -1 })
    .limit(6)
    .select('title description thumbnailUrl price lessons takenCount');

    // If not enough recommendations, add some popular courses
    if (recommendations.length < 6) {
      const additionalCourses = await Course.find({
        _id: { $nin: [...completedCourseIds, ...recommendations.map(c => c._id.toString())] },
        status: 'active'
      })
      .sort({ takenCount: -1 })
      .limit(6 - recommendations.length)
      .select('title description thumbnailUrl price lessons takenCount');

      recommendations = [...recommendations, ...additionalCourses];
    }

    // Add personalized tags based on user's learning history
    const recommendationsWithTags = recommendations.map(course => ({
      ...course.toObject(),
      tags: generatePersonalizedTags(course, completedCourses),
      difficulty: calculateDifficulty(course, userProgress)
    }));

    return NextResponse.json({ 
      recommendations: recommendationsWithTags,
      userStats: {
        totalCoursesCompleted: userProgress.totalCoursesCompleted,
        totalLessonsCompleted: userProgress.totalLessonsCompleted,
        achievements: userProgress.achievements.length
      }
    });

  } catch (error) {
    console.error('Error fetching course recommendations:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function generatePersonalizedTags(course: any, completedCourses: any[]) {
  const tags = [];
  
  // Add difficulty tag
  if (course.lessons && course.lessons.length > 0) {
    if (course.lessons.length <= 3) tags.push('Beginner');
    else if (course.lessons.length <= 6) tags.push('Intermediate');
    else tags.push('Advanced');
  }
  
  // Add popularity tag
  if (course.takenCount > 100) tags.push('Popular');
  if (course.takenCount > 500) tags.push('Best Seller');
  
  // Add completion time estimate
  if (course.lessons && course.lessons.length > 0) {
    const estimatedHours = Math.ceil(course.lessons.length * 0.5);
    tags.push(`${estimatedHours}h Course`);
  }
  
  return tags;
}

function calculateDifficulty(course: any, userProgress: any) {
  if (!course.lessons || course.lessons.length === 0) return 'Beginner';
  
  const userLevel = userProgress.totalCoursesCompleted;
  const courseComplexity = course.lessons.length;
  
  if (userLevel === 0) return 'Beginner';
  if (userLevel >= 5 && courseComplexity <= 3) return 'Easy';
  if (userLevel >= 10 && courseComplexity <= 5) return 'Easy';
  if (courseComplexity >= 8) return 'Challenging';
  
  return 'Intermediate';
}
