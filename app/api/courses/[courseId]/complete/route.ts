import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { connectMongoose } from '@/lib/mongodb';
import UserProgress from '@/app/models/userProgress';
import Course from '@/app/models/course';
import User from '@/app/models/user';
import { sendEmail, createCourseCompletionTemplate } from '@/lib/sendEmail';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const resolvedParams = await params;
    console.log('Course completion API called for course:', resolvedParams.courseId);
    
    // Get the request body first to check for user identification
    let requestBody;
    try {
      requestBody = await request.json();
    } catch (error) {
      console.log('Error parsing request body:', error);
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }
    
    // Check for user identification in request body (email or phone number)
    const userEmail = requestBody.userEmail;
    const userPhoneNumber = requestBody.userPhoneNumber;
    
    if (!userEmail && !userPhoneNumber) {
      console.log('No user identification provided in request body');
      return NextResponse.json({ 
        error: 'Authentication failed - user email or phone number required'
      }, { status: 401 });
    }

    await connectMongoose();

    // Get user by email or phone number
    let user = null;
    if (userEmail) {
      // Validate email format if email is provided
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(userEmail)) {
        return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
      }
      user = await User.findOne({ email: userEmail });
    } else if (userPhoneNumber) {
      user = await User.findOne({ phoneNumber: userPhoneNumber });
    }
    
    if (!user) {
      console.log('User not found in database for identification:', userEmail || userPhoneNumber);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    console.log('User found:', { id: user._id, email: user.email, phoneNumber: user.phoneNumber, name: user.name });

    // Get course
    const course = await Course.findById(resolvedParams.courseId);
    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    // Get or create user progress
    let userProgress = await UserProgress.findOne({ userId: user._id });
    if (!userProgress) {
      userProgress = new UserProgress({
        userId: user._id,
        courses: [],
        totalCoursesCompleted: 0,
        totalLessonsCompleted: 0,
        achievements: [],
        lastActivity: new Date(),
      });
    }

    // Find existing course progress or create new
    let courseProgress = userProgress.courses.find(
      (cp: any) => cp.courseId.toString() === resolvedParams.courseId
    );

    if (!courseProgress) {
      courseProgress = {
        courseId: course._id,
        lessons: [],
        startedAt: new Date(),
        totalTimeSpent: 0,
        isCompleted: false,
        completionPercentage: 0,
      };
      userProgress.courses.push(courseProgress);
    }

    // Update lesson completion
    const { lessonIndex, timeSpent, testScore } = requestBody;
    
    if (lessonIndex !== undefined) {
      let lessonProgress = courseProgress.lessons.find(
        (lp: any) => lp.lessonIndex === lessonIndex
      );

      if (!lessonProgress) {
        lessonProgress = {
          lessonIndex,
          completed: false,
          timeSpent: 0,
        };
        courseProgress.lessons.push(lessonProgress);
      }

      // Mark lesson as completed
      lessonProgress.completed = true;
      lessonProgress.completedAt = new Date();
      if (timeSpent !== undefined) {
        lessonProgress.timeSpent = timeSpent;
        courseProgress.totalTimeSpent += timeSpent;
      }
      if (testScore !== undefined) {
        lessonProgress.testScore = testScore;
      }
    }

    // Calculate completion percentage
    const totalLessons = course.lessons.length;
    const completedLessons = courseProgress.lessons.filter((lp: any) => lp.completed).length;
    courseProgress.completionPercentage = Math.round((completedLessons / totalLessons) * 100);

    // Check if course is completed
    const wasCompleted = courseProgress.isCompleted;
    if (completedLessons === totalLessons && !courseProgress.isCompleted) {
      courseProgress.isCompleted = true;
      courseProgress.completedAt = new Date();
      userProgress.totalCoursesCompleted += 1;
      
      // Add achievements
      const newAchievements = [];
      
      if (!userProgress.achievements.includes('course_completion')) {
        userProgress.achievements.push('course_completion');
        newAchievements.push('course_completion');
      }
      
      if (!userProgress.achievements.includes(`course_${course.title.toLowerCase().replace(/\s+/g, '_')}`)) {
        userProgress.achievements.push(`course_${course.title.toLowerCase().replace(/\s+/g, '_')}`);
        newAchievements.push(`course_${course.title.toLowerCase().replace(/\s+/g, '_')}`);
      }

      // Add milestone achievements
      if (userProgress.totalCoursesCompleted === 1 && !userProgress.achievements.includes('first_course')) {
        userProgress.achievements.push('first_course');
        newAchievements.push('first_course');
      }
      
      if (userProgress.totalCoursesCompleted === 5 && !userProgress.achievements.includes('course_enthusiast')) {
        userProgress.achievements.push('course_enthusiast');
        newAchievements.push('course_enthusiast');
      }
      
      if (userProgress.totalCoursesCompleted === 10 && !userProgress.achievements.includes('course_master')) {
        userProgress.achievements.push('course_master');
        newAchievements.push('course_master');
      }

      // Add time-based achievements
      const totalTimeHours = Math.floor(courseProgress.totalTimeSpent / 3600);
      if (totalTimeHours >= 1 && !userProgress.achievements.includes('dedicated_learner')) {
        userProgress.achievements.push('dedicated_learner');
        newAchievements.push('dedicated_learner');
      }
      
      if (totalTimeHours >= 5 && !userProgress.achievements.includes('persistent_student')) {
        userProgress.achievements.push('persistent_student');
        newAchievements.push('persistent_student');
      }

      // Send completion email if this is a new completion and user has email
      if (user.email && newAchievements.length > 0) {
        try {
          const { html, text } = createCourseCompletionTemplate(
            course.title,
            user.name,
            courseProgress.completedAt,
            newAchievements
          );
          
          await sendEmail({
            to: user.email,
            subject: `🎉 Congratulations! You've completed "${course.title}"`,
            html,
            text,
          });
        } catch (emailError) {
          console.error('Failed to send completion email:', emailError);
          // Don't fail the completion if email fails
        }
      }
    }

    // Update total lessons completed
    userProgress.totalLessonsCompleted = userProgress.courses.reduce(
      (total: number, cp: any) => total + cp.lessons.filter((lp: any) => lp.completed).length,
      0
    );

    // Add lesson completion achievements
    if (userProgress.totalLessonsCompleted >= 10 && !userProgress.achievements.includes('lesson_explorer')) {
      userProgress.achievements.push('lesson_explorer');
    }
    
    if (userProgress.totalLessonsCompleted >= 50 && !userProgress.achievements.includes('lesson_master')) {
      userProgress.achievements.push('lesson_master');
    }

    userProgress.lastActivity = new Date();

    await userProgress.save();

    return NextResponse.json({
      success: true,
      courseProgress: {
        isCompleted: courseProgress.isCompleted,
        completionPercentage: courseProgress.completionPercentage,
        completedLessons,
        totalLessons,
        totalTimeSpent: courseProgress.totalTimeSpent,
        achievements: userProgress.achievements,
        wasCompleted,
        newAchievements: wasCompleted ? [] : (courseProgress.isCompleted ? userProgress.achievements.filter((a: string) => 
          a === 'course_completion' || 
          a === `course_${course.title.toLowerCase().replace(/\s+/g, '_')}` ||
          a === 'first_course' ||
          a === 'course_enthusiast' ||
          a === 'course_master' ||
          a === 'dedicated_learner' ||
          a === 'persistent_student'
        ) : []),
      },
    });

  } catch (error) {
    console.error('Error completing course:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const resolvedParams = await params;
    console.log('GET request to course completion API for course:', resolvedParams.courseId);
    
    // Get session from NextAuth
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    
    // Check if user has either email or phone number
    const userEmail = (session.user as any).email;
    const userPhoneNumber = (session.user as any).phoneNumber;
    
    if (!userEmail && !userPhoneNumber) {
      return NextResponse.json({ error: 'User identification required' }, { status: 401 });
    }
    
    await connectMongoose();

    // Find user by email or phone number
    let user = null;
    if (userEmail) {
      user = await User.findOne({ email: userEmail });
    } else if (userPhoneNumber) {
      user = await User.findOne({ phoneNumber: userPhoneNumber });
    }
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userProgress = await UserProgress.findOne({ userId: user._id });
    if (!userProgress) {
      return NextResponse.json({
        courseProgress: {
          isCompleted: false,
          completionPercentage: 0,
          completedLessons: 0,
          totalLessons: 0,
          lessons: [],
          achievements: [],
          totalTimeSpent: 0,
        },
      });
    }

    const courseProgress = userProgress.courses.find(
      (cp: any) => cp.courseId.toString() === resolvedParams.courseId
    );

    if (!courseProgress) {
      return NextResponse.json({
        courseProgress: {
          isCompleted: false,
          completionPercentage: 0,
          completedLessons: 0,
          totalLessons: 0,
          lessons: [],
          achievements: [],
          totalTimeSpent: 0,
        },
      });
    }

    return NextResponse.json({
      courseProgress: {
        isCompleted: courseProgress.isCompleted,
        completionPercentage: courseProgress.completionPercentage,
        completedLessons: courseProgress.lessons.filter((lp: any) => lp.completed).length,
        totalLessons: courseProgress.lessons.length,
        lessons: courseProgress.lessons,
        achievements: userProgress.achievements,
        totalTimeSpent: courseProgress.totalTimeSpent,
      },
    });

  } catch (error) {
    console.error('Error fetching course progress:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
