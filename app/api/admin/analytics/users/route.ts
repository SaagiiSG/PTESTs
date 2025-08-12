import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { connectMongoose } from '@/lib/mongodb';
import UserProgress from '@/app/models/userProgress';
import User from '@/app/models/user';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Analytics Users API called');
    
    const session = await auth();
    console.log('📋 Session data:', {
      exists: !!session,
      user: session?.user ? {
        id: session.user.id,
        email: session.user.email,
        name: (session.user as any).name,
        isAdmin: (session.user as any).isAdmin
      } : 'no user'
    });
    
    if (!session?.user?.email && !(session?.user as any)?.phoneNumber) {
      console.log('❌ No session or user email/phone found');
      return NextResponse.json({ error: 'Unauthorized - No session' }, { status: 401 });
    }

    // Check if user is admin - try multiple authentication methods
    await connectMongoose();
    let user = null;
    
    if (session.user.email) {
      user = await User.findOne({ email: session.user.email });
    } else if ((session.user as any).phoneNumber) {
      user = await User.findOne({ phoneNumber: (session.user as any).phoneNumber });
    }
    
    // Fallback: try to find user by ID if we have it
    if (!user && session.user.id) {
      user = await User.findById(session.user.id);
    }
    
    console.log('👤 User lookup result:', {
      found: !!user,
      email: user?.email,
      phone: user?.phoneNumber,
      isAdmin: user?.isAdmin,
      name: user?.name,
      id: user?._id
    });
    
    if (!user?.isAdmin) {
      console.log('❌ User not found or not admin');
      return NextResponse.json({ 
        error: 'Forbidden - Not admin', 
        userFound: !!user,
        isAdmin: user?.isAdmin 
      }, { status: 403 });
    }

    console.log('✅ Admin user authenticated, proceeding with analytics...');

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
      sum + (up.totalCoursesCompleted || 0), 0
    );
    
    const totalLessonsCompleted = allUserProgress.reduce((sum, up) => 
      sum + (up.totalLessonsCompleted || 0), 0
    );
    
    // Calculate average completion rate
    const totalEnrollments = allUserProgress.reduce((sum, up) => 
      sum + (up.courses?.length || 0), 0
    );
    
    const totalCompletions = allUserProgress.reduce((sum, up) => 
      sum + (up.courses?.filter(cp => cp.isCompleted)?.length || 0), 0
    );
    
    const averageCompletionRate = totalEnrollments > 0 
      ? (totalCompletions / totalEnrollments) * 100 
      : 0;
    
    // Find top achievers
    const topAchievers = allUserProgress
      .filter(up => (up.totalCoursesCompleted || 0) > 0)
      .sort((a, b) => {
        // Sort by courses completed first, then by achievements
        if ((a.totalCoursesCompleted || 0) !== (b.totalCoursesCompleted || 0)) {
          return (b.totalCoursesCompleted || 0) - (a.totalCoursesCompleted || 0);
        }
        return (b.achievements?.length || 0) - (a.achievements?.length || 0);
      })
      .slice(0, 10) // Top 10
      .map(up => ({
        name: up.userId.toString(), // We'll need to populate this with actual user names
        coursesCompleted: up.totalCoursesCompleted || 0,
        achievements: up.achievements?.length || 0,
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
