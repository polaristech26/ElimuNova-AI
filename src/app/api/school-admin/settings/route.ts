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

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const category = searchParams.get('category') || ''
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    // Get school admin's school ID
    const schoolAdmin = await prisma.schoolAdmin.findFirst({
      where: { userId: session.user.id },
      select: { schoolId: true }
    })
    
    if (!schoolAdmin) {
      return NextResponse.json({ error: 'School admin not found' }, { status: 404 })
    }

    const where: any = {
      schoolId: schoolAdmin.schoolId
    }
    
    // Search filter
    if (search) {
      where.OR = [
        { key: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    }
    
    // Category filter
    if (category && category !== 'all') {
      where.category = category
    }

    // Sort configuration
    const orderBy: any = {}
    if (sortBy === 'key') {
      orderBy.key = sortOrder
    } else if (sortBy === 'category') {
      orderBy.category = sortOrder
    } else if (sortBy === 'updatedAt') {
      orderBy.updatedAt = sortOrder
    } else {
      orderBy.createdAt = sortOrder
    }

    const [settings, total] = await Promise.all([
      prisma.schoolSettings.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy,
        include: {
          updatedByUser: {
            select: {
              firstName: true,
              lastName: true,
              email: true
            }
          }
        }
      }),
      prisma.schoolSettings.count({ where })
    ])

    const pages = Math.ceil(total / limit)

    return NextResponse.json({
      settings,
      pagination: {
        page,
        limit,
        total,
        pages
      }
    })
  } catch (error) {
    console.error('Error fetching school settings:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is school admin
    if (session.user.role !== 'SCHOOL_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { 
      key, 
      value, 
      type = 'string',
      category = 'general',
      description,
      isEditable = true
    } = body

    // Get school admin's school ID
    const schoolAdmin = await prisma.schoolAdmin.findFirst({
      where: { userId: session.user.id },
      select: { schoolId: true }
    })
    
    if (!schoolAdmin) {
      return NextResponse.json({ error: 'School admin not found' }, { status: 404 })
    }

    // Validate required fields
    if (!key || value === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Check if setting already exists for this school
    const existingSetting = await prisma.schoolSettings.findFirst({
      where: {
        schoolId: schoolAdmin.schoolId,
        key
      }
    })

    if (existingSetting) {
      return NextResponse.json({ error: 'Setting with this key already exists for this school' }, { status: 400 })
    }

    // Create setting
    const setting = await prisma.schoolSettings.create({
      data: {
        schoolId: schoolAdmin.schoolId,
        key,
        value: typeof value === 'string' ? value : JSON.stringify(value),
        type,
        category,
        description,
        isEditable,
        updatedBy: session.user.id
      },
      include: {
        updatedByUser: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json(setting, { status: 201 })
  } catch (error) {
    console.error('Error creating school setting:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
