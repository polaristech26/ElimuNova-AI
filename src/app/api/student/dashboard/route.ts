import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    console.log('📊 Fetching student dashboard data...')
    const session = await getServerSession(authOptions)
    
    console.log('Session:', session?.user?.email, session?.user?.role)
    
    if (!session || session.user.role !== 'STUDENT') {
      console.log('❌ Unauthorized - not a student')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('🔍 Looking for student with userId:', session.user.id)
    
    // Get student profile
    const student = await prisma.student.findUnique({
      where: { userId: session.user.id },
      include: {
        user: true,
        school: true,
        teacher: {
          include: {
            user: true
          }
        },
        class: true,
        analytics: true
      }
    })

    if (!student) {
      console.log('❌ Student profile not found for userId:', session.user.id)
      return NextResponse.json({ error: 'Student profile not found' }, { status: 404 })
    }
    
    console.log('✅ Found student:', student.user.email)

    // Get assignments data
    const assignments = await prisma.assignment.findMany({
      where: {
        students: {
          some: {
            id: student.id
          }
        }
      },
      include: {
        teacher: {
          include: {
            user: true
          }
        },
        submissions: {
          where: {
            studentId: student.id
          }
        }
      },
      orderBy: {
        dueDate: 'asc'
      }
    })

    // Get study sessions for the current week
    const startOfWeek = new Date()
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay())
    startOfWeek.setHours(0, 0, 0, 0)

    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(endOfWeek.getDate() + 7)

    const studySessions = await prisma.studySession.findMany({
      where: {
        studentId: student.id,
        startTime: {
          gte: startOfWeek,
          lt: endOfWeek
        }
      },
      orderBy: {
        startTime: 'desc'
      }
    })

    // Get recent AI tutor sessions
    const aiTutorSessions = await prisma.aITutorSession.findMany({
      where: {
        studentId: student.id
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 5
    })

    // Calculate analytics
    const totalStudyTime = studySessions.reduce((total, session) => total + session.duration, 0)
    
    const completedAssignments = assignments.filter(assignment => 
      assignment.submissions.some(submission => submission.status === 'GRADED')
    ).length

    const pendingAssignments = assignments.filter(assignment => 
      !assignment.submissions.some(submission => submission.status === 'GRADED') &&
      assignment.dueDate > new Date()
    ).length

    const overdueAssignments = assignments.filter(assignment => 
      !assignment.submissions.some(submission => submission.status === 'GRADED') &&
      assignment.dueDate <= new Date()
    ).length

    // Calculate average grade
    const gradedSubmissions = assignments.flatMap(assignment => 
      assignment.submissions.filter(submission => submission.grade !== null)
    )
    
    const averageGrade = gradedSubmissions.length > 0 
      ? gradedSubmissions.reduce((sum, submission) => sum + (submission.grade || 0), 0) / gradedSubmissions.length
      : null

    // Get upcoming lessons (from schedules)
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(23, 59, 59, 999)

    const upcomingLessons = await prisma.schedule.findMany({
      where: {
        schoolId: student.schoolId,
        startTime: {
          gte: today,
          lte: tomorrow
        },
        type: 'CLASS'
      },
      include: {
        teacher: {
          include: {
            user: true
          }
        },
        class: true
      },
      orderBy: {
        startTime: 'asc'
      }
    })

    // Update or create analytics record
    const analyticsData = {
      totalStudyTime: student.analytics?.totalStudyTime || 0,
      averageGrade: averageGrade,
      completedAssignments,
      pendingAssignments,
      overdueAssignments,
      lastActiveDate: new Date(),
      weeklyGoal: student.analytics?.weeklyGoal || 300,
      monthlyGoal: student.analytics?.monthlyGoal || 1200
    }

    await prisma.studentAnalytics.upsert({
      where: { studentId: student.id },
      update: analyticsData,
      create: {
        studentId: student.id,
        ...analyticsData
      }
    })

    // Prepare dashboard data
    const dashboardData = {
      student: {
        id: student.id,
        name: `${student.user.firstName} ${student.user.lastName}`,
        email: student.user.email,
        school: student.school.name,
        teacher: `${student.teacher.user.firstName} ${student.teacher.user.lastName}`,
        class: student.class?.name || 'Not assigned'
      },
      stats: {
        activeAssignments: pendingAssignments,
        completedAssignments,
        averageGrade: averageGrade ? Math.round(averageGrade) : null,
        studyTime: totalStudyTime,
        overdueAssignments
      },
      assignments: assignments.map(assignment => ({
        id: assignment.id,
        title: assignment.title,
        description: assignment.description,
        dueDate: assignment.dueDate,
        status: assignment.submissions.length > 0 ? 
          (assignment.submissions[0].status === 'GRADED' ? 'Completed' : 'Submitted') : 
          (assignment.dueDate < new Date() ? 'Overdue' : 'Pending'),
        grade: assignment.submissions.find(s => s.grade !== null)?.grade || null,
        teacher: `${assignment.teacher.user.firstName} ${assignment.teacher.user.lastName}`,
        subject: assignment.lessonPlan?.subject || 'General'
      })),
      upcomingLessons: upcomingLessons.map(lesson => ({
        id: lesson.id,
        title: lesson.title,
        subject: lesson.subject || 'General',
        topic: lesson.description,
        time: lesson.startTime.toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        teacher: `${lesson.teacher.user.firstName} ${lesson.teacher.user.lastName}`,
        location: lesson.location
      })),
      studySessions: studySessions.map(session => ({
        id: session.id,
        subject: session.subject,
        topic: session.topic,
        duration: session.duration,
        startTime: session.startTime,
        endTime: session.endTime,
        notes: session.notes
      })),
      aiTutorSessions: aiTutorSessions.map(session => ({
        id: session.id,
        sessionType: session.sessionType,
        subject: session.subject,
        topic: session.topic,
        question: session.question,
        response: session.response,
        rating: session.rating,
        isHelpful: session.isHelpful,
        createdAt: session.createdAt
      })),
      analytics: analyticsData
    }

    return NextResponse.json(dashboardData)

  } catch (error) {
    console.error('Error fetching student dashboard data:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch dashboard data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
