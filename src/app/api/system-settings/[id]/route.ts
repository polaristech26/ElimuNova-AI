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

    const setting = await prisma.systemSettings.findUnique({
      where: { id },
      include: {
        updatedByUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    })

    if (!setting) {
      return NextResponse.json({ error: 'Setting not found' }, { status: 404 })
    }

    return NextResponse.json(setting)
  } catch (error) {
    console.error('Error fetching system setting:', error)
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

    const { id } = await params
    const body = await request.json()
    const { 
      value,
      type,
      category,
      description,
      isPublic,
      isEditable
    } = body

    // Check if setting exists
    const existingSetting = await prisma.systemSettings.findUnique({
      where: { id }
    })

    if (!existingSetting) {
      return NextResponse.json({ error: 'Setting not found' }, { status: 404 })
    }

    // Check if setting is editable
    if (!existingSetting.isEditable) {
      return NextResponse.json({ error: 'This setting cannot be edited' }, { status: 400 })
    }

    // Update system setting
    const setting = await prisma.systemSettings.update({
      where: { id },
      data: {
        ...(value !== undefined && { value }),
        ...(type !== undefined && { type }),
        ...(category !== undefined && { category }),
        ...(description !== undefined && { description }),
        ...(isPublic !== undefined && { isPublic }),
        ...(isEditable !== undefined && { isEditable }),
        updatedBy: session.user.id
      },
      include: {
        updatedByUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json(setting)
  } catch (error) {
    console.error('Error updating system setting:', error)
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

    // Check if setting exists
    const existingSetting = await prisma.systemSettings.findUnique({
      where: { id }
    })

    if (!existingSetting) {
      return NextResponse.json({ error: 'Setting not found' }, { status: 404 })
    }

    // Check if setting is editable (only editable settings can be deleted)
    if (!existingSetting.isEditable) {
      return NextResponse.json({ error: 'This setting cannot be deleted' }, { status: 400 })
    }

    // Delete system setting
    await prisma.systemSettings.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Setting deleted successfully' })
  } catch (error) {
    console.error('Error deleting system setting:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
