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
    const eventType = searchParams.get('eventType') || ''
    const severity = searchParams.get('severity') || ''
    const resolved = searchParams.get('resolved') || ''
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    const where: any = {}
    
    // Search filter
    if (search) {
      where.OR = [
        { description: { contains: search, mode: 'insensitive' } },
        { ipAddress: { contains: search, mode: 'insensitive' } }
      ]
    }
    
    // Event type filter
    if (eventType && eventType !== 'all-events') {
      where.eventType = eventType
    }
    
    // Severity filter
    if (severity && severity !== 'all-severities') {
      where.severity = severity
    }

    // Resolved filter
    if (resolved && resolved !== 'all-status') {
      where.resolved = resolved === 'resolved'
    }

    // Sort configuration
    const orderBy: any = {}
    if (sortBy === 'eventType') {
      orderBy.eventType = sortOrder
    } else if (sortBy === 'severity') {
      orderBy.severity = sortOrder
    } else if (sortBy === 'resolved') {
      orderBy.resolved = sortOrder
    } else {
      orderBy.createdAt = sortOrder
    }

    const [logs, total] = await Promise.all([
      prisma.securityLog.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy,
        include: {
          user: {
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
              name: true
            }
          },
          resolver: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          }
        }
      }),
      prisma.securityLog.count({ where })
    ])

    const pages = Math.ceil(total / limit)

    return NextResponse.json({
      logs,
      pagination: {
        page,
        limit,
        total,
        pages
      }
    })
  } catch (error) {
    console.error('Error fetching security logs:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
