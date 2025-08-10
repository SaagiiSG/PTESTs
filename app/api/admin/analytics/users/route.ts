import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { connectMongoose } from '@/lib/mongodb';
import UserProgress from '@/app/models/userProgress';
import User from '@/app/models/user';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    await connectMongoose();
    const user = await User.findOne({ email: session.user.email });
    if (!user?.isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get all users
    const totalUsers = await User.countDocuments();
    
    // Get all user progress data
    const allUserProgress = await UserProgress.find({});
    
    // Calculate active users (users with activity in the last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const activeUsers = allUserProgress.filter(up => 
      up.lastActivity && up.lastActivity > thirtyDaysAgo
    ).length;
    
    // Calculate total courses and lessons completed
    const totalCoursesCompleted = allUserProgress.reduce((sum, up) => 
      sum + up.totalCoursesCompleted, 0
    );
    
    const totalLessonsCompleted = allUserProgress.reduce((sum, up) => 
      sum + up.totalLessonsCompleted, 0
    );
    
    // Calculate average completion rate
    const totalEnrollments = allUserProgress.reduce((sum, up) => 
      sum + up.courses.length, 0
    );
    
    const totalCompletions = allUserProgress.reduce((sum, up) => 
      sum + up.courses.filter(cp => cp.isCompleted).length, 0
    );
    
    const averageCompletionRate = totalEnrollments > 0 
      ? (totalCompletions / totalEnrollments) * 100 
      : 0;
    
    // Find top achievers
    const topAchievers = allUserProgress
      .filter(up => up.totalCoursesCompleted > 0)
      .sort((a, b) => {
        // Sort by courses completed first, then by achievements
        if (a.totalCoursesCompleted !== b.totalCoursesCompleted) {
          return b.totalCoursesCompleted - a.totalCoursesCompleted;
        }
        return b.achievements.length - a.achievements.length;
      })
      .slice(0, 10) // Top 10
      .map(up => ({
        name: up.userId.toString(), // We'll need to populate this with actual user names
        coursesCompleted: up.totalCoursesCompleted,
        achievements: up.achievements.length,
      }));
    
    // Get user names for top achievers
    const userIds = topAchievers.map(achiever => achiever.name);
    const users = await User.find({ _id: { $in: userIds } });
    
    const topAchieversWithNames = topAchievers.map(achiever => {
      const user = users.find(u => u._id.toString() === achiever.name);
      return {
        ...achiever,
        name: user?.name || 'Unknown User',
      };
    });

    return NextResponse.json({
      totalUsers,
      activeUsers,
      totalCoursesCompleted,
      totalLessonsCompleted,
      averageCompletionRate,
      topAchievers: topAchieversWithNames,
      totalEnrollments,
      totalCompletions,
    });

  } catch (error) {
    console.error('Error fetching user analytics:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
