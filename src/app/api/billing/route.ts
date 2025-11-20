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

    // Check if user is super admin or school admin
    if (session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'SCHOOL_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''
    const type = searchParams.get('type') || ''
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    const where: any = {}
    
    // For school admins, filter by their school
    if (session.user.role === 'SCHOOL_ADMIN') {
      // Get the school admin's school ID
      const schoolAdmin = await prisma.schoolAdmin.findFirst({
        where: { userId: session.user.id },
        select: { schoolId: true }
      })
      
      if (!schoolAdmin) {
        return NextResponse.json({ error: 'School admin not found' }, { status: 404 })
      }
      
      where.schoolId = schoolAdmin.schoolId
    }
    
    // Search filter
    if (search) {
      where.OR = [
        { school: { name: { contains: search, mode: 'insensitive' } } },
        { package: { name: { contains: search, mode: 'insensitive' } } },
        { transactionId: { contains: search, mode: 'insensitive' } },
        { paymentMethod: { contains: search, mode: 'insensitive' } },
        { notes: { contains: search, mode: 'insensitive' } }
      ]
    }
    
    // Status filter
    if (status && status !== 'all') {
      where.status = status
    }
    
    // Type filter
    if (type && type !== 'all') {
      where.type = type
    }

    // Sort configuration
    const orderBy: any = {}
    if (sortBy === 'amount') {
      orderBy.amount = sortOrder
    } else if (sortBy === 'status') {
      orderBy.status = sortOrder
    } else if (sortBy === 'startDate') {
      orderBy.startDate = sortOrder
    } else if (sortBy === 'endDate') {
      orderBy.endDate = sortOrder
    } else if (sortBy === 'type') {
      orderBy.type = sortOrder
    } else if (sortBy === 'paymentMethod') {
      orderBy.paymentMethod = sortOrder
    } else {
      orderBy.createdAt = sortOrder
    }

    const [subscriptions, total] = await Promise.all([
      prisma.subscription.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy,
        include: {
          school: {
            select: {
              id: true,
              name: true,
              address: true,
              phone: true,
              email: true,
              schoolAdmin: {
                include: {
                  user: {
                    select: {
                      firstName: true,
                      lastName: true,
                      email: true
                    }
                  }
                }
              }
            }
          },
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          },
          package: {
            select: {
              id: true,
              name: true,
              description: true,
              price: true,
              duration: true,
              features: true
            }
          }
        } as any
      }),
      prisma.subscription.count({ where })
    ])

    const pages = Math.ceil(total / limit)

    // Calculate comprehensive billing metrics for super admin dashboard
    let billingMetrics = {}
    
    if (session.user.role === 'SUPER_ADMIN') {
      // Calculate total revenue from active subscriptions
      const totalRevenue = await prisma.subscription.aggregate({
        _sum: { amount: true },
        where: { status: 'ACTIVE' as any }
      })

      // Calculate monthly revenue (subscriptions created this month)
      const currentMonth = new Date()
      const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
      const monthlyRevenue = await prisma.subscription.aggregate({
        _sum: { amount: true },
        where: {
          status: 'ACTIVE' as any,
          createdAt: { gte: monthStart }
        }
      })

      // Get subscription counts by status
      const [activeSubscriptions, trialSubscriptions, totalSubscriptions] = await Promise.all([
        prisma.subscription.count({ where: { status: 'ACTIVE' as any } }),
        prisma.subscription.count({ where: { status: 'TRIAL' as any } }),
        prisma.subscription.count()
      ])

      // Calculate conversion rate
      const conversionRate = (activeSubscriptions + trialSubscriptions) > 0 
        ? Math.round((activeSubscriptions / (activeSubscriptions + trialSubscriptions)) * 100)
        : 0

      // Get payment analytics from invoices
      const [successfulPayments, pendingPayments] = await Promise.all([
        prisma.invoice.count({ where: { status: 'PAID' } }),
        prisma.invoice.count({ where: { status: 'PENDING' } })
      ])

      const totalPayments = successfulPayments + pendingPayments
      const paymentSuccessRate = totalPayments > 0 
        ? Math.round((successfulPayments / totalPayments) * 100)
        : 100

      billingMetrics = {
        totalRevenue: totalRevenue._sum.amount || 0,
        monthlyRevenue: monthlyRevenue._sum.amount || 0,
        activeSubscriptions,
        totalSubscriptions,
        trialSubscriptions,
        conversionRate,
        successfulPayments,
        pendingPayments,
        paymentSuccessRate
      }
    }

    return NextResponse.json({
      subscriptions,
      pagination: {
        page,
        limit,
        total,
        pages
      },
      ...billingMetrics
    })
  } catch (error) {
    console.error('Error fetching billing data:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is super admin or school admin
    if (session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'SCHOOL_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    let { 
      schoolId, 
      packageId, 
      startDate, 
      endDate,
      amount,
      status = 'ACTIVE',
      type = 'SUBSCRIPTION',
      paymentMethod = 'MANUAL',
      transactionId,
      notes
    } = body

    // For school admins, use their school ID
    if (session.user.role === 'SCHOOL_ADMIN') {
      const schoolAdmin = await prisma.schoolAdmin.findFirst({
        where: { userId: session.user.id },
        select: { schoolId: true }
      })
      
      if (!schoolAdmin) {
        return NextResponse.json({ error: 'School admin not found' }, { status: 404 })
      }
      
      schoolId = schoolAdmin.schoolId
    }

    // Validate required fields
    if (!schoolId || !packageId || !startDate || !endDate || !amount) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Check if school exists
    const school = await prisma.school.findUnique({
      where: { id: schoolId }
    })

    if (!school) {
      return NextResponse.json({ error: 'School not found' }, { status: 404 })
    }

    // Check if package exists
    const packageData = await prisma.package.findUnique({
      where: { id: packageId }
    })

    if (!packageData) {
      return NextResponse.json({ error: 'Package not found' }, { status: 404 })
    }

    // Create subscription
    const subscription = await prisma.subscription.create({
      data: {
        schoolId,
        packageId,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        amount,
        status,
        type,
        paymentMethod,
        transactionId,
        notes
      },
      include: {
        school: {
          select: {
            id: true,
            name: true,
            address: true,
            phone: true,
            email: true,
            schoolAdmin: {
              include: {
                user: {
                  select: {
                    firstName: true,
                    lastName: true,
                    email: true
                  }
                }
              }
            }
          }
        },
        package: {
          select: {
            id: true,
            name: true,
            description: true,
            price: true,
            duration: true,
            features: true
          }
        }
      }
    })

    return NextResponse.json(subscription, { status: 201 })
  } catch (error) {
    console.error('Error creating subscription:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
