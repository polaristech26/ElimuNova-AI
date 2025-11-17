import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    console.log('📚 Fetching student school info...')
    const session = await getServerSession(authOptions)
    
    console.log('Session:', session?.user?.email, session?.user?.role)
    
    if (!session?.user || session.user.role !== 'STUDENT') {
      console.log('❌ Unauthorized - not a student')
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.log('🔍 Looking for student with userId:', session.user.id)
    
    // Get student record
    const student = await prisma.student.findUnique({
      where: { userId: session.user.id },
      include: {
        school: true,
        teacher: {
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
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    })

    if (!student) {
      console.log('❌ Student record not found for userId:', session.user.id)
      return NextResponse.json(
        { error: 'Student record not found' },
        { status: 404 }
      )
    }
    
    if (!student.school) {
      console.log('❌ School not found for student:', student.id)
      return NextResponse.json(
        { error: 'School information not found' },
        { status: 404 }
      )
    }
    
    console.log('✅ Found student and school:', student.user.email, student.school.name)

    return NextResponse.json({
      school: {
        id: student.school.id,
        name: student.school.name,
        address: student.school.address,
        phone: student.school.phone,
        email: student.school.email,
        website: student.school.website,
        logo: student.school.logo,
        createdAt: student.school.createdAt.toISOString()
      },
      teacher: student.teacher ? {
        firstName: student.teacher.user.firstName,
        lastName: student.teacher.user.lastName,
        email: student.teacher.user.email
      } : null,
      student: {
        firstName: student.user.firstName,
        lastName: student.user.lastName,
        email: student.user.email
      }
    })
  } catch (error) {
    console.error('Error fetching student school info:', error)
    return NextResponse.json(
      { error: 'Failed to fetch school information' },
      { status: 500 }
    )
  }
}
