import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { connectMongoose } from '@/lib/mongodb';
import UserProgress from '@/app/models/userProgress';
import Course from '@/app/models/course';
import User from '@/app/models/user';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectMongoose();

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userProgress = await UserProgress.findOne({ userId: user._id });
    if (!userProgress) {
      return NextResponse.json({
        userProgress: {
          totalCoursesCompleted: 0,
          totalLessonsCompleted: 0,
          achievements: [],
          courses: [],
        },
      });
    }

    // Get course titles for the progress data
    const courseIds = userProgress.courses.map(cp => cp.courseId);
    const courses = await Course.find({ _id: { $in: courseIds } });

    const coursesWithTitles = userProgress.courses.map(cp => {
      const course = courses.find(c => c._id.toString() === cp.courseId.toString());
      return {
        ...cp.toObject(),
        courseTitle: course?.title || 'Unknown Course',
      };
    });

    return NextResponse.json({
      userProgress: {
        totalCoursesCompleted: userProgress.totalCoursesCompleted,
        totalLessonsCompleted: userProgress.totalLessonsCompleted,
        achievements: userProgress.achievements,
        courses: coursesWithTitles,
      },
    });

  } catch (error) {
    console.error('Error fetching user progress:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
