import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logActivity } from '@/lib/activity-logger'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is school admin
    if (session.user.role !== 'SCHOOL_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params

    // Get school admin's school ID
    const schoolAdmin = await prisma.schoolAdmin.findUnique({
      where: { userId: session.user.id }
    })

    if (!schoolAdmin) {
      return NextResponse.json({ error: 'School admin not found' }, { status: 404 })
    }

    // Get meeting
    const meeting = await prisma.meeting.findFirst({
      where: {
        id,
        schoolId: schoolAdmin.schoolId
      },
      include: {
        creator: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    })

    if (!meeting) {
      return NextResponse.json({ error: 'Meeting not found' }, { status: 404 })
    }

    const formattedMeeting = {
      id: meeting.id,
      title: meeting.title,
      description: meeting.description,
      date: meeting.date.toISOString().split('T')[0],
      time: meeting.time,
      duration: meeting.duration,
      location: meeting.location,
      status: meeting.status,
      attendees: meeting.attendees,
      createdBy: {
        name: `${meeting.creator.firstName} ${meeting.creator.lastName}`,
        email: meeting.creator.email
      },
      createdAt: meeting.createdAt,
      updatedAt: meeting.updatedAt
    }

    return NextResponse.json({ meeting: formattedMeeting })

  } catch (error) {
    console.error('Error fetching meeting:', error)
    return NextResponse.json(
      { error: 'Failed to fetch meeting' },
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

    // Check if user is school admin
    if (session.user.role !== 'SCHOOL_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()
    const { title, description, date, time, duration, location, status, attendees } = body

    // Get school admin's school ID
    const schoolAdmin = await prisma.schoolAdmin.findUnique({
      where: { userId: session.user.id }
    })

    if (!schoolAdmin) {
      return NextResponse.json({ error: 'School admin not found' }, { status: 404 })
    }

    // Check if meeting exists
    const existingMeeting = await prisma.meeting.findFirst({
      where: {
        id,
        schoolId: schoolAdmin.schoolId
      }
    })

    if (!existingMeeting) {
      return NextResponse.json({ error: 'Meeting not found' }, { status: 404 })
    }

    // Validate status if provided
    if (status) {
      const validStatuses = ['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'POSTPONED'];
      
      if (!validStatuses.includes(status)) {
        return NextResponse.json({ 
          error: 'Invalid status. Must be one of: ' + validStatuses.join(', ') 
        }, { status: 400 });
      }
    }

    // Update meeting
    const updatedMeeting = await prisma.meeting.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(date && { date: new Date(date) }),
        ...(time && { time }),
        ...(duration && { duration }),
        ...(location !== undefined && { location }),
        ...(status && { status: status as any }), // Cast to MeetingStatus enum
        ...(attendees !== undefined && { attendees })
      },
      include: {
        creator: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    })

    // Log activity if status changed
    if (status && status !== existingMeeting.status) {
      await logActivity({
        schoolId: schoolAdmin.schoolId,
        userId: session.user.id,
        type: 'MEETING_SCHEDULED',
        action: 'Meeting Status Updated',
        description: `Meeting status changed to: ${status}`,
        metadata: {
          meetingId: updatedMeeting.id,
          oldStatus: existingMeeting.status,
          newStatus: status,
          title: updatedMeeting.title
        }
      })
    }

    const formattedMeeting = {
      id: updatedMeeting.id,
      title: updatedMeeting.title,
      description: updatedMeeting.description,
      date: updatedMeeting.date.toISOString().split('T')[0],
      time: updatedMeeting.time,
      duration: updatedMeeting.duration,
      location: updatedMeeting.location,
      status: updatedMeeting.status,
      attendees: updatedMeeting.attendees,
      createdBy: {
        name: `${updatedMeeting.creator.firstName} ${updatedMeeting.creator.lastName}`,
        email: updatedMeeting.creator.email
      },
      createdAt: updatedMeeting.createdAt,
      updatedAt: updatedMeeting.updatedAt
    }

    return NextResponse.json({ 
      message: 'Meeting updated successfully',
      meeting: formattedMeeting
    })

  } catch (error) {
    console.error('Error updating meeting:', error)
    return NextResponse.json(
      { error: 'Failed to update meeting' },
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

    // Check if user is school admin
    if (session.user.role !== 'SCHOOL_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params

    // Get school admin's school ID
    const schoolAdmin = await prisma.schoolAdmin.findUnique({
      where: { userId: session.user.id }
    })

    if (!schoolAdmin) {
      return NextResponse.json({ error: 'School admin not found' }, { status: 404 })
    }

    // Check if meeting exists
    const existingMeeting = await prisma.meeting.findFirst({
      where: {
        id,
        schoolId: schoolAdmin.schoolId
      }
    })

    if (!existingMeeting) {
      return NextResponse.json({ error: 'Meeting not found' }, { status: 404 })
    }

    // Delete meeting
    await prisma.meeting.delete({
      where: { id }
    })

    // Log activity
    await logActivity({
      schoolId: schoolAdmin.schoolId,
      userId: session.user.id,
      type: 'MEETING_SCHEDULED',
      action: 'Meeting Deleted',
      description: `Deleted meeting: ${existingMeeting.title}`,
      metadata: {
        meetingId: existingMeeting.id,
        title: existingMeeting.title,
        date: existingMeeting.date
      }
    })

    return NextResponse.json({ message: 'Meeting deleted successfully' })

  } catch (error) {
    console.error('Error deleting meeting:', error)
    return NextResponse.json(
      { error: 'Failed to delete meeting' },
      { status: 500 }
    )
  }
}
