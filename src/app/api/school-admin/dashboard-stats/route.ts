import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is school admin
    if (session.user.role !== 'SCHOOL_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get school admin's school ID
    const schoolAdmin = await prisma.schoolAdmin.findUnique({
      where: { userId: session.user.id },
      include: { school: true }
    })

    if (!schoolAdmin) {
      return NextResponse.json({ error: 'School admin not found' }, { status: 404 })
    }

    const schoolId = schoolAdmin.schoolId

    // Get current date for monthly calculations
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)

    // Fetch all statistics in parallel
    const [
      totalTeachers,
      totalStudents,
      activeClasses,
      monthlyRevenue,
      lastMonthRevenue,
      recentTeachers,
      recentStudents,
      schoolInfo,
      recentActivities
    ] = await Promise.all([
      // Total Teachers
      prisma.teacher.count({
        where: { schoolId }
      }),

      // Total Students
      prisma.student.count({
        where: { schoolId }
      }),

      // Active Classes (assuming each teacher represents a class)
      prisma.teacher.count({
        where: { 
          schoolId,
          user: { isActive: true }
        }
      }),

      // Monthly Revenue (current month)
      prisma.subscription.aggregate({
        where: {
          schoolId,
          status: 'ACTIVE',
          startDate: { gte: startOfMonth }
        },
        _sum: { amount: true }
      }),

      // Last Month Revenue for comparison
      prisma.subscription.aggregate({
        where: {
          schoolId,
          status: 'ACTIVE',
          startDate: { gte: startOfLastMonth, lte: endOfLastMonth }
        },
        _sum: { amount: true }
      }),

      // Recent Teachers (last 5)
      prisma.teacher.findMany({
        where: { schoolId },
        take: 5,
        orderBy: { user: { createdAt: 'desc' } },
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
              createdAt: true,
              isActive: true
            }
          },
          students: {
            select: { id: true }
          }
        }
      }),

      // Recent Students (last 5)
      prisma.student.findMany({
        where: { schoolId },
        take: 5,
        orderBy: { user: { createdAt: 'desc' } },
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
              createdAt: true,
              isActive: true
            }
          },
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
      }),

      // School Information
      prisma.school.findUnique({
        where: { id: schoolId },
        include: {
          subscriptions: {
            where: { status: 'ACTIVE' },
            include: {
              package: {
                select: {
                  name: true,
                  price: true
                }
              }
            },
            orderBy: { createdAt: 'desc' },
            take: 1
          }
        }
      }),

      // Recent Activities (last 3)
      prisma.activity.findMany({
        where: { schoolId },
        take: 3,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
              role: true
            }
          }
        }
      })
    ])

    // Calculate revenue change percentage
    const currentRevenue = monthlyRevenue._sum.amount || 0
    const previousRevenue = lastMonthRevenue._sum.amount || 0
    const revenueChange = previousRevenue > 0 
      ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 
      : 0

    // Format recent teachers data
    const formattedTeachers = recentTeachers.map(teacher => ({
      id: teacher.id,
      name: `${teacher.user.firstName} ${teacher.user.lastName}`,
      email: teacher.user.email,
      students: teacher.students.length,
      status: teacher.user.isActive ? 'Active' : 'Inactive',
      joinDate: teacher.user.createdAt.toISOString().split('T')[0]
    }))

    // Format recent students data
    const formattedStudents = recentStudents.map(student => ({
      id: student.id,
      name: `${student.user.firstName} ${student.user.lastName}`,
      email: student.user.email,
      teacher: `${student.teacher.user.firstName} ${student.teacher.user.lastName}`,
      status: student.user.isActive ? 'Active' : 'Inactive',
      joinDate: student.user.createdAt.toISOString().split('T')[0]
    }))

    // Format recent activities data
    const formattedActivities = recentActivities.map(activity => ({
      id: activity.id,
      type: activity.type,
      action: activity.action,
      description: activity.description,
      metadata: activity.metadata,
      user: activity.user ? {
        name: `${activity.user.firstName} ${activity.user.lastName}`,
        email: activity.user.email,
        role: activity.user.role
      } : null,
      createdAt: activity.createdAt
    }))

    // Get current package info
    const currentPackage = schoolInfo?.subscriptions[0]?.package
    const packageName = currentPackage?.name || 'No Package'
    const packagePrice = currentPackage?.price || 0

    const stats = {
      totalTeachers: {
        value: totalTeachers,
        change: totalTeachers > 0 ? `+${totalTeachers} total` : 'No teachers yet'
      },
      totalStudents: {
        value: totalStudents,
        change: totalStudents > 0 ? `+${totalStudents} total` : 'No students yet'
      },
      activeClasses: {
        value: activeClasses,
        change: activeClasses > 0 ? `${activeClasses} active classes` : 'No active classes'
      },
      monthlyRevenue: {
        value: currentRevenue,
        change: revenueChange > 0 
          ? `+${revenueChange.toFixed(1)}% from last month`
          : revenueChange < 0 
            ? `${revenueChange.toFixed(1)}% from last month`
            : 'No change from last month'
      }
    }

    const response = {
      stats,
      recentTeachers: formattedTeachers,
      recentStudents: formattedStudents,
      recentActivities: formattedActivities,
      schoolInfo: {
        name: schoolInfo?.name || 'Unknown School',
        address: schoolInfo?.address || 'Address not set',
        package: packageName,
        subscription: schoolInfo?.subscriptions[0]?.status || 'INACTIVE',
        packagePrice: packagePrice
      }
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Error fetching school admin dashboard stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard statistics' },
      { status: 500 }
    )
  }
}
