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

    // Check if user is super admin
    if (session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params
    const report = await prisma.report.findUnique({
      where: { id },
      include: {
        generatedByUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        school: {
          select: {
            id: true,
            name: true,
            email: true,
            address: true,
            phone: true
          }
        }
      }
    })

    if (!report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 })
    }

    return NextResponse.json(report)
  } catch (error) {
    console.error('Error fetching report:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
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

    // Check if user is super admin
    if (session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { 
      title,
      description,
      type,
      status,
      content,
      filters,
      schoolId,
      isPublic,
      scheduledAt,
      expiresAt
    } = body

    const { id } = await params
    
    // Check if report exists
    const existingReport = await prisma.report.findUnique({
      where: { id }
    })

    if (!existingReport) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 })
    }

    // Update report
    const report = await prisma.report.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(type && { type }),
        ...(status && { status }),
        ...(content && { content }),
        ...(filters !== undefined && { filters }),
        ...(schoolId !== undefined && { schoolId }),
        ...(isPublic !== undefined && { isPublic }),
        ...(scheduledAt && { scheduledAt: new Date(scheduledAt) }),
        ...(expiresAt && { expiresAt: new Date(expiresAt) })
      },
      include: {
        generatedByUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        school: {
          select: {
            id: true,
            name: true,
            email: true,
            address: true,
            phone: true
          }
        }
      }
    })

    return NextResponse.json(report)
  } catch (error) {
    console.error('Error updating report:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
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

    // Check if user is super admin
    if (session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params
    
    // Check if report exists
    const existingReport = await prisma.report.findUnique({
      where: { id }
    })

    if (!existingReport) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 })
    }

    // Delete report
    await prisma.report.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Report deleted successfully' })
  } catch (error) {
    console.error('Error deleting report:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
