import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get teacher information
    const teacher = await prisma.teacher.findFirst({
      where: { userId: session.user.id },
      include: { user: true }
    });

    if (!teacher) {
      return NextResponse.json({ error: 'Teacher not found' }, { status: 404 });
    }

    // Get current week start and end dates
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    // Get stats in parallel
    const [
      totalStudents,
      activeLessonPlans,
      pendingAssignments,
      completedThisWeek,
      recentActivities
    ] = await Promise.all([
      // Total students assigned to this teacher
      prisma.student.count({
        where: { teacherId: teacher.id }
      }),

      // Active lesson plans (created in last 30 days)
      prisma.lessonPlan.count({
        where: {
          teacherId: teacher.id,
          createdAt: {
            gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
          }
        }
      }),

      // Pending assignments (assignments with ungraded submissions)
      prisma.assignment.count({
        where: {
          teacherId: teacher.id,
          submissions: {
            some: {
              grade: null
            }
          }
        }
      }),

      // Completed assignments this week (assignments with graded submissions this week)
      // If no graded submissions, fallback to assignments created this week
      prisma.assignment.count({
        where: {
          teacherId: teacher.id,
          OR: [
            {
              submissions: {
                some: {
                  grade: { not: null },
                  gradedAt: {
                    gte: startOfWeek,
                    lte: endOfWeek
                  }
                }
              }
            },
            {
              createdAt: {
                gte: startOfWeek,
                lte: endOfWeek
              },
              submissions: {
                some: {}
              }
            }
          ]
        }
      }),

      // Recent activities (last 3)
      prisma.activity.findMany({
        where: { 
          schoolId: teacher.schoolId,
          userId: session.user.id
        },
        take: 3,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true
            }
          }
        }
      })
    ]);

    console.log('Dashboard Stats Debug:', {
      totalStudents,
      activeLessonPlans,
      pendingAssignments,
      completedThisWeek,
      startOfWeek: startOfWeek.toISOString(),
      endOfWeek: endOfWeek.toISOString()
    });

    // Generate AI insights for completed this week
    let aiInsights = '';
    if (completedThisWeek > 0) {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001';
        const insightsResponse = await fetch(`${baseUrl}/api/ai/chat`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: `Generate a brief motivational insight for a teacher who completed ${completedThisWeek} assignments this week. Keep it encouraging and professional, under 50 words.`,
            context: 'teacher_dashboard_insights'
          })
        });

        if (insightsResponse.ok) {
          const insightsData = await insightsResponse.json();
          aiInsights = insightsData.response || 'Great progress this week!';
        } else {
          aiInsights = 'Great progress this week!';
        }
      } catch (error) {
        console.error('Error generating AI insights:', error);
        aiInsights = 'Great progress this week!';
      }
    } else {
      aiInsights = 'Ready to tackle this week\'s assignments!';
    }

    // Calculate percentage changes (mock data for now)
    const stats = {
      totalStudents: {
        value: totalStudents,
        change: '+12%',
        changeType: 'positive' as const
      },
      activeLessonPlans: {
        value: activeLessonPlans,
        change: 'All up to date',
        changeType: 'neutral' as const
      },
      pendingAssignments: {
        value: pendingAssignments,
        change: 'Needs review',
        changeType: 'warning' as const
      },
      completedThisWeek: {
        value: completedThisWeek,
        change: aiInsights,
        changeType: 'positive' as const
      }
    };

    return NextResponse.json({
      stats,
      recentActivities: recentActivities.map(activity => ({
        id: activity.id,
        type: activity.type.toLowerCase(),
        action: activity.action,
        description: activity.description,
        time: activity.createdAt,
        user: activity.user ? `${activity.user.firstName} ${activity.user.lastName}` : 'System'
      }))
    });

  } catch (error) {
    console.error('Error fetching teacher dashboard stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    );
  }
}
