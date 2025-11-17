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
        },
        {
          teacher: {
            user: {
              OR: [
                {
                  firstName: {
                    contains: search,
                    mode: 'insensitive'
                  }
                },
                {
                  lastName: {
                    contains: search,
                    mode: 'insensitive'
                  }
                }
              ]
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

    // Get students with pagination
    const [students, total] = await Promise.all([
      prisma.student.findMany({
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
          teacher: {
            include: {
              user: {
                select: {
                  firstName: true,
                  lastName: true
                }
              }
            }
          },
          class: {
            select: {
              name: true,
              subject: true,
              grade: true
            }
          }
        }
      }),
      prisma.student.count({ where })
    ])

    // Format students data
    const formattedStudents = students.map(student => ({
      id: student.id,
      name: `${student.user.firstName} ${student.user.lastName}`,
      email: student.user.email,
      teacher: `${student.teacher.user.firstName} ${student.teacher.user.lastName}`,
      class: student.class?.name,
      grade: student.class?.grade,
      status: student.user.isActive ? 'Active' : 'Inactive',
      joinDate: student.user.createdAt.toISOString().split('T')[0],
      phone: student.user.phone,
      address: student.user.address
    }))

    return NextResponse.json({
      students: formattedStudents,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Error fetching students:', error)
    return NextResponse.json(
      { error: 'Failed to fetch students' },
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
    const { firstName, lastName, email, password, teacherId, classId } = body

    if (!firstName || !lastName || !email || !password || !teacherId) {
      return NextResponse.json(
        { error: 'All required fields must be provided' },
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
        role: 'STUDENT',
        isActive: true
      }
    })

    // Create student record
    const student = await prisma.student.create({
      data: {
        userId: user.id,
        schoolId: schoolId,
        teacherId: teacherId,
        classId: classId || null
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
      }
    })

    return NextResponse.json({
      message: 'Student enrolled successfully',
      student: {
        id: student.id,
        name: `${student.user.firstName} ${student.user.lastName}`,
        email: student.user.email,
        teacher: `${student.teacher.user.firstName} ${student.teacher.user.lastName}`,
        status: student.user.isActive ? 'Active' : 'Inactive',
        joinDate: student.user.createdAt.toISOString().split('T')[0]
      }
    })

  } catch (error) {
    console.error('Error enrolling student:', error)
    return NextResponse.json(
      { error: 'Failed to enroll student' },
      { status: 500 }
    )
  }
}