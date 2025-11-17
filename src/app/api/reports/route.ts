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

    // Check if user is super admin
    if (session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const type = searchParams.get('type') || ''
    const status = searchParams.get('status') || ''
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    const where: any = {}
    
    // Search filter
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    }
    
    // Type filter
    if (type && type !== 'all') {
      where.type = type
    }
    
    // Status filter
    if (status && status !== 'all') {
      where.status = status
    }

    // Sort configuration
    const orderBy: any = {}
    if (sortBy === 'title') {
      orderBy.title = sortOrder
    } else if (sortBy === 'type') {
      orderBy.type = sortOrder
    } else if (sortBy === 'status') {
      orderBy.status = sortOrder
    } else if (sortBy === 'updatedAt') {
      orderBy.updatedAt = sortOrder
    } else {
      orderBy.createdAt = sortOrder
    }

    const [reports, total] = await Promise.all([
      prisma.report.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy,
        include: {
          generatedByUser: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          },
          school: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      }),
      prisma.report.count({ where })
    ])

    const pages = Math.ceil(total / limit)

    return NextResponse.json({
      reports,
      pagination: {
        page,
        limit,
        total,
        pages
      }
    })
  } catch (error) {
    console.error('Error fetching reports:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is super admin
    if (session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { 
      title,
      description,
      type,
      content,
      filters,
      schoolId,
      isPublic,
      scheduledAt,
      expiresAt
    } = body

    // Validate required fields
    if (!title || !type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Create report
    const report = await prisma.report.create({
      data: {
        title,
        description,
        type,
        content: content || '{}',
        filters: filters || null,
        generatedBy: session.user.id,
        schoolId: schoolId || null,
        isPublic: isPublic || false,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        status: 'DRAFT'
      },
      include: {
        generatedByUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        school: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json(report, { status: 201 })
  } catch (error) {
    console.error('Error creating report:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
