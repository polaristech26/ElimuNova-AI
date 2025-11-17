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

    if (session.user.role !== 'SCHOOL_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get school admin's school ID
    const schoolAdmin = await prisma.schoolAdmin.findUnique({
      where: { userId: session.user.id }
    })

    if (!schoolAdmin) {
      return NextResponse.json({ error: 'School admin not found' }, { status: 404 })
    }

    // Get all active teachers in the school
    const teachers = await prisma.teacher.findMany({
      where: {
        schoolId: schoolAdmin.schoolId,
        user: { isActive: true }
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        students: {
          select: { id: true }
        }
      },
      orderBy: {
        user: { firstName: 'asc' }
      }
    })

    const formattedTeachers = teachers.map(teacher => ({
      id: teacher.id,
      userId: teacher.user.id,
      name: `${teacher.user.firstName} ${teacher.user.lastName}`,
      email: teacher.user.email,
      studentCount: teacher.students.length
    }))

    return NextResponse.json({ teachers: formattedTeachers })

  } catch (error) {
    console.error('Error fetching available teachers:', error)
    return NextResponse.json(
      { error: 'Failed to fetch available teachers' },
      { status: 500 }
    )
  }
}
