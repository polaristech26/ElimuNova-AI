import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get teacher data
    const teacher = await prisma.teacher.findUnique({
      where: { userId: session.user.id },
      include: {
        user: true,
        students: {
          include: {
            user: true,
            class: true,
            analytics: true,
            studySessions: {
              orderBy: { startTime: 'desc' },
              take: 20
            },
            submissions: {
              include: {
                assignment: {
                  include: {
                    lessonPlan: true
                  }
                }
              },
              orderBy: { submittedAt: 'desc' },
              take: 20
            },
            aiTutorSessions: {
              orderBy: { createdAt: 'desc' },
              take: 10
            }
          }
        }
      }
    })

    if (!teacher) {
      return NextResponse.json({ error: 'Teacher not found' }, { status: 404 })
    }

    // Calculate overall class metrics
    const totalStudents = teacher.students.length
    const activeStudents = teacher.students.filter(student => 
      student.studySessions.some(session => 
        new Date(session.startTime) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      )
    ).length

    const totalStudyTime = teacher.students.reduce((total, student) => 
      total + student.studySessions.reduce((sum, session) => sum + session.duration, 0), 0
    )

    const averageGrade = teacher.students.reduce((total, student) => {
      const gradedSubmissions = student.submissions.filter(s => s.grade !== null)
      if (gradedSubmissions.length > 0) {
        const studentAverage = gradedSubmissions.reduce((sum, s) => sum + (s.grade || 0), 0) / gradedSubmissions.length
        return total + studentAverage
      }
      return total
    }, 0) / totalStudents

    const totalAssignments = teacher.students.reduce((total, student) => 
      total + student.submissions.length, 0
    )

    const completedAssignments = teacher.students.reduce((total, student) => 
      total + student.submissions.filter(s => s.status === 'submitted').length, 0
    )

    // Student progress details
    const studentProgress = teacher.students.map(student => {
      const weeklyStudyTime = student.studySessions
        .filter(session => new Date(session.startTime) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
        .reduce((total, session) => total + session.duration, 0)

      const monthlyStudyTime = student.studySessions
        .filter(session => new Date(session.startTime) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
        .reduce((total, session) => total + session.duration, 0)

      const gradedSubmissions = student.submissions.filter(s => s.grade !== null)
      const studentAverageGrade = gradedSubmissions.length > 0 
        ? gradedSubmissions.reduce((sum, s) => sum + (s.grade || 0), 0) / gradedSubmissions.length
        : null

      const completedAssignments = student.submissions.filter(s => s.status === 'submitted').length
      const pendingAssignments = student.submissions.filter(s => s.status === 'pending').length
      const overdueAssignments = student.submissions.filter(s => 
        s.status === 'pending' && new Date(s.assignment.dueDate) < new Date()
      ).length

      const recentAIActivity = student.aiTutorSessions.length
      const lastAISession = student.aiTutorSessions[0]?.createdAt

      return {
        id: student.id,
        name: `${student.user.firstName} ${student.user.lastName}`,
        email: student.user.email,
        grade: student.class?.name || 'Grade 8',
        weeklyStudyTime,
        monthlyStudyTime,
        averageGrade: studentAverageGrade,
        completedAssignments,
        pendingAssignments,
        overdueAssignments,
        recentAIActivity,
        lastAISession,
        lastStudySession: student.studySessions[0]?.startTime,
        lastSubmission: student.submissions[0]?.submittedAt,
        analytics: student.analytics
      }
    })

    // Sort students by performance
    const sortedStudents = studentProgress.sort((a, b) => {
      const aScore = (a.averageGrade || 0) + (a.weeklyStudyTime / 60) + a.completedAssignments
      const bScore = (b.averageGrade || 0) + (b.weeklyStudyTime / 60) + b.completedAssignments
      return bScore - aScore
    })

    // AI insights for teacher
    const aiInsights = {
      topPerformers: sortedStudents.slice(0, 3),
      needsAttention: sortedStudents.filter(s => 
        s.averageGrade && s.averageGrade < 60 || s.overdueAssignments > 2
      ),
      mostActive: sortedStudents.sort((a, b) => b.weeklyStudyTime - a.weeklyStudyTime).slice(0, 3),
      aiEngagement: sortedStudents.sort((a, b) => b.recentAIActivity - a.recentAIActivity).slice(0, 3)
    }

    const monitorData = {
      // Class overview
      classOverview: {
        totalStudents,
        activeStudents,
        totalStudyTime,
        averageGrade: Math.round(averageGrade || 0),
        totalAssignments,
        completedAssignments,
        completionRate: totalAssignments > 0 ? Math.round((completedAssignments / totalAssignments) * 100) : 0
      },

      // Individual student progress
      studentProgress: sortedStudents,

      // AI insights
      aiInsights,

      // Teacher info
      teacher: {
        name: `${teacher.user.firstName} ${teacher.user.lastName}`,
        email: teacher.user.email
      }
    }

    return NextResponse.json(monitorData)

  } catch (error) {
    console.error('Error fetching student progress monitor data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch monitor data' },
      { status: 500 }
    )
  }
}
