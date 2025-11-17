import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get student profile
    const student = await prisma.student.findUnique({
      where: { userId: session.user.id },
      include: {
        class: {
          include: {
            teacher: {
              include: {
                user: {
                  select: {
                    firstName: true,
                    lastName: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!student) {
      return NextResponse.json({ error: 'Student profile not found' }, { status: 404 });
    }

    if (!student.class) {
      return NextResponse.json({ 
        lessonPlans: [],
        message: 'No class assigned. Please contact your teacher.'
      });
    }

    // Get lesson plans shared with this student's class
    const lessonPlans = await prisma.lessonPlan.findMany({
      where: {
        teacherId: student.class.teacherId,
        isShared: true
      },
      select: {
        id: true,
        title: true,
        subject: true,
        grade: true,
        content: true,
        createdAt: true,
        teacher: {
          select: {
            user: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Parse content for each lesson plan
    const processedLessonPlans = lessonPlans.map(plan => ({
      ...plan,
      content: typeof plan.content === 'string' ? JSON.parse(plan.content) : plan.content,
      teacherName: `${plan.teacher.user.firstName} ${plan.teacher.user.lastName}`
    }));

    return NextResponse.json({
      lessonPlans: processedLessonPlans,
      total: processedLessonPlans.length,
      studentClass: {
        name: student.class.name,
        subject: student.class.subject,
        grade: student.class.grade
      }
    });

  } catch (error) {
    console.error('Error fetching student lesson plans:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch lesson plans',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
