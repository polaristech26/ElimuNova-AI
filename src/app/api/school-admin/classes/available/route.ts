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

    const { searchParams } = new URL(request.url)
    const teacherId = searchParams.get('teacherId')

    // Build where clause
    const where: any = {
      schoolId: schoolAdmin.schoolId,
      isActive: true
    }

    // If teacherId is provided, filter by teacher
    if (teacherId) {
      where.teacherId = teacherId
    }

    // Get all active classes in the school
    const classes = await prisma.class.findMany({
      where,
      include: {
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
        students: {
          select: { id: true }
        }
      },
      orderBy: {
        name: 'asc'
      }
    })

    const formattedClasses = classes.map(cls => ({
      id: cls.id,
      name: cls.name,
      subject: cls.subject,
      grade: cls.grade,
      teacherName: `${cls.teacher.user.firstName} ${cls.teacher.user.lastName}`,
      studentCount: cls.students.length
    }))

    return NextResponse.json({ classes: formattedClasses })

  } catch (error) {
    console.error('Error fetching available classes:', error)
    return NextResponse.json(
      { error: 'Failed to fetch available classes' },
      { status: 500 }
    )
  }
}
