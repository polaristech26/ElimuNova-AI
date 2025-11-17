import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

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

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || 'all'

    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {
      schoolId
    }

    if (search) {
      where.OR = [
        {
          user: {
            firstName: {
              contains: search,
              mode: 'insensitive'
            }
          }
        },
        {
          user: {
            lastName: {
              contains: search,
              mode: 'insensitive'
            }
          }
        },
        {
          user: {
            email: {
              contains: search,
              mode: 'insensitive'
            }
          }
        }
      ]
    }

    if (status !== 'all') {
      where.user = {
        ...where.user,
        isActive: status === 'active'
      }
    }

    // Get teachers with pagination
    const [teachers, total] = await Promise.all([
      prisma.teacher.findMany({
        where,
        skip,
        take: limit,
        orderBy: { user: { createdAt: 'desc' } },
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
              createdAt: true,
              isActive: true,
              phone: true,
              address: true
            }
          },
          students: {
            select: { id: true }
          },
          classes: {
            select: {
              name: true,
              subject: true
            }
          }
        }
      }),
      prisma.teacher.count({ where })
    ])

    // Format teachers data
    const formattedTeachers = teachers.map(teacher => ({
      id: teacher.id,
      name: `${teacher.user.firstName} ${teacher.user.lastName}`,
      email: teacher.user.email,
      students: teacher.students.length,
      status: teacher.user.isActive ? 'Active' : 'Inactive',
      joinDate: teacher.user.createdAt.toISOString().split('T')[0],
      phone: teacher.user.phone,
      address: teacher.user.address,
      subjects: teacher.classes.map(cls => cls.subject).filter(Boolean)
    }))

    return NextResponse.json({
      teachers: formattedTeachers,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Error fetching teachers:', error)
    return NextResponse.json(
      { error: 'Failed to fetch teachers' },
      { status: 500 }
    )
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

    // Get school admin's school ID
    const schoolAdmin = await prisma.schoolAdmin.findUnique({
      where: { userId: session.user.id },
      include: { school: true }
    })

    if (!schoolAdmin) {
      return NextResponse.json({ error: 'School admin not found' }, { status: 404 })
    }

    const schoolId = schoolAdmin.schoolId
    const body = await request.json()
    const { firstName, lastName, email, password } = body

    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user
    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        password: hashedPassword,
        role: 'TEACHER',
        isActive: true
      }
    })

    // Create teacher record
    const teacher = await prisma.teacher.create({
      data: {
        userId: user.id,
        schoolId: schoolId
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            createdAt: true,
            isActive: true
          }
        }
      }
    })

    return NextResponse.json({
      message: 'Teacher enrolled successfully',
      teacher: {
        id: teacher.id,
        name: `${teacher.user.firstName} ${teacher.user.lastName}`,
        email: teacher.user.email,
        status: teacher.user.isActive ? 'Active' : 'Inactive',
        joinDate: teacher.user.createdAt.toISOString().split('T')[0]
      }
    })

  } catch (error) {
    console.error('Error enrolling teacher:', error)
    return NextResponse.json(
      { error: 'Failed to enroll teacher' },
      { status: 500 }
    )
  }
}