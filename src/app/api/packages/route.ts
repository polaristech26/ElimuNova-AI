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

    // Sort configuration
    const orderBy: any = {}
    if (sortBy === 'name') {
      orderBy.name = sortOrder
    } else if (sortBy === 'price') {
      orderBy.price = sortOrder
    } else if (sortBy === 'duration') {
      orderBy.duration = sortOrder
    } else if (sortBy === 'maxTeachers') {
      orderBy.maxTeachers = sortOrder
    } else if (sortBy === 'maxStudents') {
      orderBy.maxStudents = sortOrder
    } else {
      orderBy.createdAt = sortOrder
    }

    const [packages, total] = await Promise.all([
      prisma.package.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy,
        include: {
          subscriptions: {
            where: { status: 'ACTIVE' },
            select: { id: true }
          },
          _count: {
            select: {
              subscriptions: true
            }
          }
        }
      }),
      prisma.package.count({ where })
    ])

    const pages = Math.ceil(total / limit)

    return NextResponse.json({
      packages,
      pagination: {
        page,
        limit,
        total,
        pages
      }
    })
  } catch (error) {
    console.error('Error fetching packages:', error)
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
      price,
      duration,
      maxTeachers,
      maxStudents,
      features,
      isActive = true
    } = body

    // Validate required fields
    if (!name || !description || !price || !duration || !maxTeachers || !maxStudents) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Check if package name already exists
    const existingPackage = await prisma.package.findFirst({
      where: { name: { equals: name, mode: 'insensitive' } }
    })

    if (existingPackage) {
      return NextResponse.json({ error: 'Package name already exists' }, { status: 409 })
    }

    // Create package
    const packageData = await prisma.package.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        duration: parseInt(duration),
        maxTeachers: parseInt(maxTeachers),
        maxStudents: parseInt(maxStudents),
        features: features || [],
        isActive
      },
      include: {
        subscriptions: {
          where: { status: 'ACTIVE' },
          select: { id: true }
        },
        _count: {
          select: {
            subscriptions: true
          }
        }
      }
    })

    return NextResponse.json(packageData, { status: 201 })
  } catch (error) {
    console.error('Error creating package:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}