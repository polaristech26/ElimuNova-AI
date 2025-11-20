import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  let session: any = null
  
  try {
    session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      console.log('School admin dashboard stats: No session found')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== 'SCHOOL_ADMIN') {
      console.log(`School admin dashboard stats: Invalid role ${session.user.role}`)
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    console.log(`School admin dashboard stats request for user: ${session.user.id}`)

    // Get school admin record
    const schoolAdmin = await prisma.schoolAdmin.findUnique({
      where: { userId: session.user.id },
      include: {
        school: {
          select: {
            id: true,
            name: true,
            address: true,
            phone: true,
            email: true,
            isActive: true
          }
        }
      }
    })

    if (!schoolAdmin || !schoolAdmin.school) {
      console.error('School admin record not found for user:', session.user.id)
      return NextResponse.json({ error: 'School admin record not found' }, { status: 404 })
    }

    const schoolId = schoolAdmin.schoolId
    console.log(`Fetching stats for school: ${schoolId}`)

    // Get dashboard statistics
    const [
      totalTeachers,
      activeTeachers,
      totalStudents,
      activeStudents,
      totalClasses,
      subscription,
      recentTeachers,
      recentStudents
    ] = await Promise.all([
      // Teacher counts
      prisma.teacher.count({
        where: { schoolId }
      }),
      prisma.teacher.count({
        where: { 
          schoolId,
          user: { isActive: true }
        }
      }),
      
      // Student counts
      prisma.student.count({
        where: { schoolId }
      }),
      prisma.student.count({
        where: { 
          schoolId,
          user: { isActive: true }
        }
      }),

      // Class count (assuming classes are linked to teachers)
      prisma.class.count({
        where: {
          teacher: { schoolId }
        }
      }),

      // School subscription
      prisma.subscription.findFirst({
        where: { schoolId },
        include: { package: true },
        orderBy: { createdAt: 'desc' }
      }),

      // Recent teachers (last 5)
      prisma.teacher.findMany({
        where: { schoolId },
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
              isActive: true,
              createdAt: true
            }
          },
          students: {
            select: { id: true }
          }
        },
        orderBy: { 
          user: { createdAt: 'desc' }
        },
        take: 5
      }),

      // Recent students (last 5)
      prisma.student.findMany({
        where: { schoolId },
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
              isActive: true,
              createdAt: true
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
        },
        orderBy: { 
          user: { createdAt: 'desc' }
        },
        take: 5
      })
    ])

    // Calculate monthly revenue (if subscription exists)
    let monthlyRevenue = 0
    if (subscription) {
      monthlyRevenue = subscription.amount
    }

    // Format data to match what the frontend expects
    const responseData = {
      stats: {
        totalTeachers: {
          value: totalTeachers,
          change: `${activeTeachers} active`
        },
        activeTeachers: {
          value: activeTeachers,
          change: `${Math.round((activeTeachers / Math.max(totalTeachers, 1)) * 100)}% active`
        },
        totalStudents: {
          value: totalStudents,
          change: `${activeStudents} active`
        },
        activeStudents: {
          value: activeStudents,
          change: `${Math.round((activeStudents / Math.max(totalStudents, 1)) * 100)}% active`
        },
        totalClasses: {
          value: totalClasses,
          change: totalClasses > 0 ? `${Math.round(totalStudents / Math.max(totalClasses, 1))} avg students/class` : 'No classes'
        },
        activeClasses: {
          value: totalClasses, // For now, assume all classes are active
          change: totalClasses > 0 ? `${Math.round(totalStudents / Math.max(totalClasses, 1))} avg students/class` : 'No active classes'
        },
        monthlyRevenue: {
          value: monthlyRevenue,
          change: subscription ? `${subscription.package.name} plan` : 'No subscription'
        }
      },
      schoolInfo: {
        id: schoolAdmin.school.id,
        name: schoolAdmin.school.name,
        address: schoolAdmin.school.address,
        phone: schoolAdmin.school.phone,
        email: schoolAdmin.school.email,
        isActive: schoolAdmin.school.isActive,
        subscription: subscription ? {
          id: subscription.id,
          status: subscription.status,
          packageName: subscription.package.name,
          amount: subscription.amount,
          startDate: subscription.startDate,
          endDate: subscription.endDate,
          daysRemaining: Math.max(0, Math.ceil((subscription.endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
        } : null
      },
      recentTeachers: recentTeachers.map(teacher => ({
        id: teacher.id,
        name: `${teacher.user.firstName} ${teacher.user.lastName}`,
        email: teacher.user.email,
        students: teacher.students?.length || 0,
        status: teacher.user.isActive ? 'Active' : 'Inactive',
        joinDate: teacher.user.createdAt.toLocaleDateString(),
        isActive: teacher.user.isActive,
        joinedAt: teacher.user.createdAt
      })),
      recentStudents: recentStudents.map(student => ({
        id: student.id,
        name: `${student.user.firstName} ${student.user.lastName}`,
        email: student.user.email,
        teacher: student.teacher ? `${student.teacher.user.firstName} ${student.teacher.user.lastName}` : 'No teacher',
        status: student.user.isActive ? 'Active' : 'Inactive',
        joinDate: student.user.createdAt.toLocaleDateString(),
        isActive: student.user.isActive,
        joinedAt: student.user.createdAt
      })),
      recentActivities: [] // Add empty array for now, can be populated later
    }

    console.log('School admin dashboard stats retrieved successfully:', {
      schoolId,
      totalTeachers,
      totalStudents,
      hasSubscription: !!subscription
    })

    return NextResponse.json(responseData)
  } catch (error) {
    console.error('Error fetching school admin dashboard stats:', error)
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      userId: session?.user?.id,
      role: session?.user?.role
    })
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch dashboard statistics',
        debug: process.env.NODE_ENV === 'development' ? {
          message: error instanceof Error ? error.message : 'Unknown error'
        } : undefined
      },
      { status: 500 }
    )
  }
}