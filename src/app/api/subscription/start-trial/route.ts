import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { startFreeTrial } from '@/lib/subscription-service'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let userId: string | undefined
    let schoolId: string | undefined

    // Determine subscription context
    if (session.user.role === 'TEACHER') {
      const teacher = await prisma.teacher.findUnique({
        where: { userId: session.user.id }
      })
      
      if (teacher?.schoolId) {
        schoolId = teacher.schoolId
      } else {
        userId = session.user.id // Independent teacher
      }
    } else if (session.user.role === 'SCHOOL_ADMIN') {
      const schoolAdmin = await prisma.schoolAdmin.findUnique({
        where: { userId: session.user.id }
      })
      schoolId = schoolAdmin?.schoolId
    } else {
      userId = session.user.id // Independent user
    }

    if (!userId && !schoolId) {
      return NextResponse.json({ error: 'Unable to determine subscription context' }, { status: 400 })
    }

    // Check if trial already exists
    const existingSubscription = await prisma.subscription.findFirst({
      where: userId ? { userId } : { schoolId }
    })

    if (existingSubscription) {
      return NextResponse.json({ error: 'Subscription already exists' }, { status: 400 })
    }

    // Start free trial
    await startFreeTrial(userId, schoolId)

    return NextResponse.json({
      success: true,
      message: 'Free trial started successfully',
      trialDays: 7
    })
  } catch (error) {
    console.error('Error starting trial:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to start trial' },
      { status: 500 }
    )
  }
}