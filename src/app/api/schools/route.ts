import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Fetch all schools
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
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
    const status = searchParams.get('status') || ''
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    const where: any = {}
    
    // Search filter
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { address: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
        { website: { contains: search, mode: 'insensitive' } }
      ]
    }
    
    // Status filter
    if (status === 'active') {
      where.isActive = true
    } else if (status === 'inactive') {
      where.isActive = false
    }

    // Sort configuration
    const orderBy: any = {}
    if (sortBy === 'name') {
      orderBy.name = sortOrder
    } else if (sortBy === 'updatedAt') {
      orderBy.updatedAt = sortOrder
    } else {
      orderBy.createdAt = sortOrder
    }

    const [schools, total] = await Promise.all([
      prisma.school.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy,
        include: {
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
          },
          teachers: {
            select: {
              id: true,
              user: {
                select: {
                  firstName: true,
                  lastName: true
                }
              }
            }
          },
          students: {
            select: {
              id: true
            }
          },
          subscriptions: {
            where: {
              status: 'ACTIVE'
            },
            include: {
              package: {
                select: {
                  name: true,
                  price: true
                }
              }
            }
          }
        }
      }),
      prisma.school.count({ where })
    ])

    return NextResponse.json({
      schools,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching schools:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Create new school
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is super admin
    if (session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { name, address, phone, email, website } = body

    // Validate required fields
    if (!name || !address) {
      return NextResponse.json({ 
        error: 'Missing required fields: name, address' 
      }, { status: 400 })
    }

    // Check if school with same name already exists
    const existingSchool = await prisma.school.findFirst({
      where: {
        name: { equals: name.trim(), mode: 'insensitive' }
      }
    })

    if (existingSchool) {
      return NextResponse.json({ 
        error: 'School with this name already exists' 
      }, { status: 400 })
    }

    const newSchool = await prisma.school.create({
      data: {
        name: name.trim(),
        address: address.trim(),
        phone: phone?.trim() || null,
        email: email?.trim() || null,
        website: website?.trim() || null
      },
      include: {
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
        },
        teachers: {
          select: {
            id: true,
            user: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          }
        },
        students: {
          select: {
            id: true
          }
        },
        subscriptions: {
          where: {
            status: 'ACTIVE'
          },
          include: {
            package: {
              select: {
                name: true,
                price: true
              }
            }
          }
        }
      }
    })

    return NextResponse.json(newSchool, { status: 201 })
  } catch (error) {
    console.error('Error creating school:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
