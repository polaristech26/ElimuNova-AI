import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getSubscriptionStatus } from '@/lib/subscription-service'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let userId: string | undefined
    let schoolId: string | undefined

    // Determine if this is an independent user or school-based user
    if (session.user.role === 'TEACHER') {
      const teacher = await prisma.teacher.findUnique({
        where: { userId: session.user.id }
      })
      
      if (teacher?.schoolId) {
        schoolId = teacher.schoolId
      } else {
        userId = session.user.id // Independent teacher
      }
    } else if (session.user.role === 'STUDENT') {
      const student = await prisma.student.findUnique({
        where: { userId: session.user.id },
        include: { teacher: true }
      })
      
      if (student?.schoolId) {
        schoolId = student.schoolId
      } else if (student?.teacher && !student.teacher.schoolId) {
        // Independent student under independent teacher
        userId = student.teacher.userId
      } else {
        userId = session.user.id // Independent student
      }
    } else if (session.user.role === 'SCHOOL_ADMIN') {
      const schoolAdmin = await prisma.schoolAdmin.findUnique({
        where: { userId: session.user.id }
      })
      schoolId = schoolAdmin?.schoolId
    }

    if (!userId && !schoolId) {
      return NextResponse.json({ error: 'Unable to determine subscription context' }, { status: 400 })
    }

    const subscriptionInfo = await getSubscriptionStatus(userId, schoolId)

    return NextResponse.json({
      subscription: subscriptionInfo,
      context: {
        userId,
        schoolId,
        userRole: session.user.role
      }
    })
  } catch (error) {
    console.error('Error fetching subscription status:', error)
    return NextResponse.json(
      { error: 'Failed to fetch subscription status' },
      { status: 500 }
    )
  }
}