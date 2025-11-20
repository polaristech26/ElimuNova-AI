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

    if (session.user.role !== 'SCHOOL_ADMIN') {
      return NextResponse.json({ error: 'Forbidden - School admin access required' }, { status: 403 })
    }

    // Get school admin info
    const schoolAdmin = await prisma.schoolAdmin.findUnique({
      where: { userId: session.user.id },
      include: { school: true }
    })

    if (!schoolAdmin?.schoolId) {
      return NextResponse.json({ error: 'School not found' }, { status: 404 })
    }

    const schoolId = schoolAdmin.schoolId

    // Get teachers count and data
    const teachers = await prisma.teacher.findMany({
      where: { schoolId },
      include: { user: true }
    })

    // Get students count and data
    const students = await prisma.student.findMany({
      where: { schoolId },
      include: { user: true }
    })

    // Get lesson plans created by school teachers
    const lessonPlans = await prisma.lessonPlan.count({
      where: {
        teacher: {
          schoolId
        }
      }
    })

    // Get AI generations count (from activities with AI-related actions)
    const aiGenerations = await prisma.activity.count({
      where: {
        schoolId,
        OR: [
          { action: { contains: 'AI' } },
          { action: { contains: 'generate' } },
          { description: { contains: 'AI' } },
          { description: { contains: 'generated' } }
        ]
      }
    })

    // Get recent activities for engagement calculation
    const recentActivities = await prisma.activity.count({
      where: {
        schoolId,
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
        }
      }
    })

    // Get previous month activities for comparison
    const previousMonthActivities = await prisma.activity.count({
      where: {
        schoolId,
        createdAt: {
          gte: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // 60 days ago
          lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)   // 30 days ago
        }
      }
    })

    // Calculate engagement percentage (active users in last 30 days)
    const activeUsers = await prisma.activity.findMany({
      where: {
        schoolId,
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        }
      },
      select: { userId: true },
      distinct: ['userId']
    })

    const totalUsers = teachers.length + students.length
    const engagementRate = totalUsers > 0 ? Math.round((activeUsers.length / totalUsers) * 100) : 0

    // Calculate growth percentage
    const growthRate = previousMonthActivities > 0 
      ? Math.round(((recentActivities - previousMonthActivities) / previousMonthActivities) * 100)
      : recentActivities > 0 ? 100 : 0

    // Get subscription info for plan limits
    const subscription = await prisma.subscription.findFirst({
      where: { schoolId },
      include: { package: true },
      orderBy: { createdAt: 'desc' }
    })

    // Get recent invoices (mock data for now - would integrate with Stripe)
    const mockInvoices = [
      {
        id: '1',
        date: new Date().toISOString(),
        amount: subscription?.package?.price || 299.99,
        status: 'paid',
        period: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
      },
      {
        id: '2',
        date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        amount: subscription?.package?.price || 299.99,
        status: 'paid',
        period: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
      }
    ]

    // Get payment method (mock data - would integrate with Stripe)
    const mockPaymentMethod = {
      id: '1',
      type: 'card',
      brand: 'visa',
      last4: '4242',
      expiryMonth: 12,
      expiryYear: 2025,
      isPrimary: true
    }

    // Get available packages for upgrade options
    const availablePackages = await prisma.package.findMany({
      where: { isActive: true },
      orderBy: { price: 'asc' }
    })

    // Find the recommended upgrade package (Growth Plan for schools)
    const upgradePackage = availablePackages.find(pkg => pkg.name === 'Growth Plan') || 
                          availablePackages.find(pkg => pkg.maxTeachers >= 50) ||
                          availablePackages[availablePackages.length - 1] // Fallback to most expensive

    const billingData = {
      school: {
        id: schoolAdmin.school.id,
        name: schoolAdmin.school.name,
        email: schoolAdmin.school.email
      },
      currentSubscription: subscription ? {
        id: subscription.id,
        packageId: subscription.packageId,
        packageName: subscription.package.name,
        price: subscription.package.price,
        status: subscription.status,
        isTrial: (subscription as any).isTrial || false,
        endDate: subscription.endDate,
        trialEndsAt: (subscription as any).trialEndsAt || null
      } : null,
      usage: {
        teachers: {
          active: teachers.length,
          limit: subscription?.package?.maxTeachers || 100,
          percentage: subscription?.package?.maxTeachers 
            ? Math.round((teachers.length / subscription.package.maxTeachers) * 100)
            : 0
        },
        students: {
          active: students.length,
          limit: subscription?.package?.maxStudents || 1000,
          percentage: subscription?.package?.maxStudents
            ? Math.round((students.length / subscription.package.maxStudents) * 100)
            : 0
        },
        lessonPlans,
        aiGenerations,
        engagementRate,
        growthRate: growthRate > 0 ? `+${growthRate}%` : `${growthRate}%`
      },
      analytics: {
        engagement: `${engagementRate}%`,
        satisfaction: '4.8/5', // Mock data - would calculate from feedback
        activeUsers: activeUsers.length,
        totalUsers
      },
      upgradePackage: upgradePackage ? {
        id: upgradePackage.id,
        name: upgradePackage.name,
        price: upgradePackage.price,
        maxTeachers: upgradePackage.maxTeachers,
        maxStudents: upgradePackage.maxStudents,
        features: upgradePackage.features
      } : null,
      invoices: mockInvoices,
      paymentMethod: mockPaymentMethod
    }

    return NextResponse.json({ success: true, data: billingData })
  } catch (error) {
    console.error('Error fetching school billing data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch billing data' },
      { status: 500 }
    )
  }
}