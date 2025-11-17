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

    if (session.user.role !== 'TEACHER') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get teacher's school information
    const teacher = await prisma.teacher.findUnique({
      where: { userId: session.user.id },
      include: {
        school: {
          select: {
            id: true,
            name: true,
            address: true,
            phone: true,
            email: true,
            website: true,
            logo: true,
            createdAt: true
          }
        }
      }
    })

    if (!teacher) {
      return NextResponse.json({ error: 'Teacher not found' }, { status: 404 })
    }

    return NextResponse.json({ 
      school: teacher.school,
      teacher: {
        firstName: session.user.firstName,
        lastName: session.user.lastName,
        email: session.user.email
      }
    })

  } catch (error) {
    console.error('Error fetching school info:', error)
    return NextResponse.json(
      { error: 'Failed to fetch school information' },
      { status: 500 }
    )
  }
}
