import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params

    // Get activity
    const activity = await prisma.activity.findFirst({
      where: {
        id,
        schoolId: schoolAdmin.schoolId
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            role: true
          }
        }
      }
    })

    if (!activity) {
      return NextResponse.json({ error: 'Activity not found' }, { status: 404 })
    }

    return NextResponse.json({
      id: activity.id,
      type: activity.type,
      action: activity.action,
      description: activity.description,
      metadata: activity.metadata,
      user: activity.user ? {
        name: `${activity.user.firstName} ${activity.user.lastName}`,
        email: activity.user.email,
        role: activity.user.role
      } : null,
      createdAt: activity.createdAt
    })

  } catch (error) {
    console.error('Error fetching activity:', error)
    return NextResponse.json(
      { error: 'Failed to fetch activity' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params
    const body = await request.json()
    const { type, action, description, metadata } = body

    // Validate required fields
    if (!type || !action || !description) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if activity exists and belongs to school
    const existingActivity = await prisma.activity.findFirst({
      where: {
        id,
        schoolId: schoolAdmin.schoolId
      }
    })

    if (!existingActivity) {
      return NextResponse.json({ error: 'Activity not found' }, { status: 404 })
    }

    // Update activity
    const activity = await prisma.activity.update({
      where: { id },
      data: {
        type,
        action,
        description,
        metadata: metadata || null
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            role: true
          }
        }
      }
    })

    return NextResponse.json({
      message: 'Activity updated successfully',
      activity: {
        id: activity.id,
        type: activity.type,
        action: activity.action,
        description: activity.description,
        metadata: activity.metadata,
        user: activity.user ? {
          name: `${activity.user.firstName} ${activity.user.lastName}`,
          email: activity.user.email,
          role: activity.user.role
        } : null,
        createdAt: activity.createdAt
      }
    })

  } catch (error) {
    console.error('Error updating activity:', error)
    return NextResponse.json(
      { error: 'Failed to update activity' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params

    // Check if activity exists and belongs to school
    const existingActivity = await prisma.activity.findFirst({
      where: {
        id,
        schoolId: schoolAdmin.schoolId
      }
    })

    if (!existingActivity) {
      return NextResponse.json({ error: 'Activity not found' }, { status: 404 })
    }

    // Delete activity
    await prisma.activity.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Activity deleted successfully' })

  } catch (error) {
    console.error('Error deleting activity:', error)
    return NextResponse.json(
      { error: 'Failed to delete activity' },
      { status: 500 }
    )
  }
}
