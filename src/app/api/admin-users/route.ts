import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

// POST - Create new admin user
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
    const { 
      firstName, 
      lastName, 
      email, 
      password, 
      role, 
      schoolId, 
      phone, 
      address 
    } = body

    // Validate required fields
    if (!firstName || !lastName || !email || !password || !role) {
      return NextResponse.json({ 
        error: 'Missing required fields: firstName, lastName, email, password, role' 
      }, { status: 400 })
    }

    // Validate role
    const validRoles = ['SCHOOL_ADMIN', 'TEACHER', 'STUDENT']
    if (!validRoles.includes(role)) {
      return NextResponse.json({ 
        error: 'Invalid role. Must be one of: SCHOOL_ADMIN, TEACHER, STUDENT' 
      }, { status: 400 })
    }

    // Check if user with same email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    })

    if (existingUser) {
      return NextResponse.json({ 
        error: 'User with this email already exists' 
      }, { status: 400 })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user
    const newUser = await prisma.user.create({
      data: {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        role: role as any,
        phone: phone?.trim() || null,
        address: address?.trim() || null
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        phone: true,
        address: true,
        createdAt: true
      }
    })

    // If creating a school admin, create the school admin record
    if (role === 'SCHOOL_ADMIN' && schoolId) {
      await prisma.schoolAdmin.create({
        data: {
          userId: newUser.id,
          schoolId: schoolId
        }
      })
    }

    // If creating a teacher, create the teacher record
    if (role === 'TEACHER' && schoolId) {
      await prisma.teacher.create({
        data: {
          userId: newUser.id,
          schoolId: schoolId
        }
      })
    }

    // If creating a student, create the student record
    // Note: Student creation requires a teacherId, so we'll skip this for now
    // or create a default teacher relationship
    if (role === 'STUDENT' && schoolId) {
      // For now, we'll skip student creation as it requires a teacherId
      // This could be enhanced to create a default teacher or require teacher selection
      console.log('Student creation skipped - requires teacherId field')
    }

    return NextResponse.json(newUser, { status: 201 })
  } catch (error) {
    console.error('Error creating admin user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// GET - Fetch all users (for super admin)
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
    const role = searchParams.get('role') || ''
    const search = searchParams.get('search') || ''

    const where: any = {}
    
    if (role) {
      where.role = role
    }
    
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ]
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: {
          createdAt: 'desc'
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
          phone: true,
          address: true,
          createdAt: true,
          schoolAdmin: {
            include: {
              school: {
                select: {
                  name: true
                }
              }
            }
          },
          teacher: {
            include: {
              school: {
                select: {
                  name: true
                }
              }
            }
          },
          student: {
            include: {
              school: {
                select: {
                  name: true
                }
              }
            }
          }
        }
      }),
      prisma.user.count({ where })
    ])

    return NextResponse.json({
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
