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
    const policyType = searchParams.get('policyType') || ''
    const isActive = searchParams.get('isActive') || ''
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    const where: any = {}
    
    // Search filter
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    }
    
    // Policy type filter
    if (policyType && policyType !== 'all-types') {
      where.policyType = policyType
    }

    // Active filter
    if (isActive && isActive !== 'all-status') {
      where.isActive = isActive === 'active'
    }

    // Sort configuration
    const orderBy: any = {}
    if (sortBy === 'name') {
      orderBy.name = sortOrder
    } else if (sortBy === 'policyType') {
      orderBy.policyType = sortOrder
    } else if (sortBy === 'priority') {
      orderBy.priority = sortOrder
    } else if (sortBy === 'updatedAt') {
      orderBy.updatedAt = sortOrder
    } else {
      orderBy.createdAt = sortOrder
    }

    const [policies, total] = await Promise.all([
      prisma.securityPolicy.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy,
        include: {
          createdByUser: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          },
          updatedByUser: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          }
        }
      }),
      prisma.securityPolicy.count({ where })
    ])

    const pages = Math.ceil(total / limit)

    return NextResponse.json({
      policies,
      pagination: {
        page,
        limit,
        total,
        pages
      }
    })
  } catch (error) {
    console.error('Error fetching security policies:', error)
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
      name,
      description,
      policyType,
      rules,
      isActive,
      priority
    } = body

    // Validate required fields
    if (!name || !policyType || !rules) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Validate policyType is a valid SecurityPolicyType
    const validPolicyTypes = [
      'AUTHENTICATION', 'AUTHORIZATION', 'PASSWORD', 'SESSION',
      'API_RATE_LIMITING', 'IP_WHITELIST', 'IP_BLACKLIST', 'FILE_UPLOAD',
      'DATA_ACCESS', 'AUDIT_LOGGING'
    ]
    
    if (!validPolicyTypes.includes(policyType)) {
      return NextResponse.json({ 
        error: 'Invalid policyType. Must be one of: ' + validPolicyTypes.join(', ') 
      }, { status: 400 })
    }

    // Validate rules JSON
    try {
      JSON.parse(rules)
    } catch {
      return NextResponse.json({ error: 'Invalid rules JSON format' }, { status: 400 })
    }

    // Create security policy
    const policy = await prisma.securityPolicy.create({
      data: {
        name,
        description,
        policyType: policyType as any, // Cast to SecurityPolicyType enum
        rules,
        isActive: isActive !== false,
        priority: priority || 0,
        createdBy: session.user.id,
        updatedBy: session.user.id
      },
      include: {
        createdByUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        updatedByUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json(policy, { status: 201 })
  } catch (error) {
    console.error('Error creating security policy:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
