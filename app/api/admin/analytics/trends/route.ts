import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { connectMongoose } from '@/lib/mongodb';
import User from '@/app/models/user';
import Course from '@/app/models/course';
import UserProgress from '@/app/models/userProgress';
import Purchase from '@/app/models/purchase';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email && !(session?.user as any)?.phoneNumber) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
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
    
    if (!user?.isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30');

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get user registration trends
    const userTrends = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // Get course enrollment trends
    const enrollmentTrends = await UserProgress.aggregate([
      {
        $unwind: "$courses"
      },
      {
        $match: {
          "courses.enrolledAt": { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$courses.enrolledAt" }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // Get course completion trends
    const completionTrends = await UserProgress.aggregate([
      {
        $unwind: "$courses"
      },
      {
        $match: {
          "courses.completedAt": { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$courses.completedAt" }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // Get revenue trends
    const revenueTrends = await Purchase.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          status: 'completed'
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
          },
          revenue: { $sum: "$amount" },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // Generate complete date range with all metrics
    const dateRange = [];
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      
      const userCount = userTrends.find(t => t._id === dateStr)?.count || 0;
      const enrollmentCount = enrollmentTrends.find(t => t._id === dateStr)?.count || 0;
      const completionCount = completionTrends.find(t => t._id === dateStr)?.count || 0;
      const revenue = revenueTrends.find(t => t._id === dateStr)?.revenue || 0;
      
      dateRange.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        users: userCount,
        enrollments: enrollmentCount,
        completions: completionCount,
        revenue: revenue
      });
    }

    // Calculate cumulative totals
    let cumulativeUsers = 0;
    let cumulativeEnrollments = 0;
    let cumulativeCompletions = 0;
    let cumulativeRevenue = 0;

    const trendsWithCumulative = dateRange.map(day => {
      cumulativeUsers += day.users;
      cumulativeEnrollments += day.enrollments;
      cumulativeCompletions += day.completions;
      cumulativeRevenue += day.revenue;
      
      return {
        ...day,
        cumulativeUsers,
        cumulativeEnrollments,
        cumulativeCompletions,
        cumulativeRevenue
      };
    });

    return NextResponse.json({
      trends: trendsWithCumulative,
      summary: {
        totalDays: days,
        totalNewUsers: cumulativeUsers,
        totalEnrollments: cumulativeEnrollments,
        totalCompletions: cumulativeCompletions,
        totalRevenue: cumulativeRevenue,
        averageDailyUsers: Math.round(cumulativeUsers / days),
        averageDailyRevenue: Math.round(cumulativeRevenue / days)
      }
    });

  } catch (error) {
    console.error('Error fetching trend analytics:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
