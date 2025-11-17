import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is super admin
    if (session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const packageData = await prisma.package.findUnique({
      where: { id },
      include: {
        subscriptions: {
          include: {
            school: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        },
        _count: {
          select: {
            subscriptions: true
          }
        }
      }
    })

    if (!packageData) {
      return NextResponse.json({ error: 'Package not found' }, { status: 404 })
    }

    return NextResponse.json(packageData)
  } catch (error) {
    console.error('Error fetching package:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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
      name,
      description,
      price,
      duration,
      maxTeachers,
      maxStudents,
      features,
      isActive
    } = body

    // Check if package exists
    const existingPackage = await prisma.package.findUnique({
      where: { id }
    })

    if (!existingPackage) {
      return NextResponse.json({ error: 'Package not found' }, { status: 404 })
    }

    // Check if name is being changed and if new name already exists
    if (name && name !== existingPackage.name) {
      const nameExists = await prisma.package.findFirst({
        where: { 
          name: { equals: name, mode: 'insensitive' },
          id: { not: id }
        }
      })

      if (nameExists) {
        return NextResponse.json({ error: 'Package name already exists' }, { status: 409 })
      }
    }

    // Update package
    const packageData = await prisma.package.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description && { description }),
        ...(price && { price: parseFloat(price) }),
        ...(duration && { duration: parseInt(duration) }),
        ...(maxTeachers && { maxTeachers: parseInt(maxTeachers) }),
        ...(maxStudents && { maxStudents: parseInt(maxStudents) }),
        ...(features && { features }),
        ...(isActive !== undefined && { isActive })
      },
      include: {
        subscriptions: {
          include: {
            school: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        },
        _count: {
          select: {
            subscriptions: true
          }
        }
      }
    })

    return NextResponse.json(packageData)
  } catch (error) {
    console.error('Error updating package:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is super admin
    if (session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Check if package exists
    const existingPackage = await prisma.package.findUnique({
      where: { id },
      include: {
        subscriptions: {
          where: { status: 'ACTIVE' }
        }
      }
    })

    if (!existingPackage) {
      return NextResponse.json({ error: 'Package not found' }, { status: 404 })
    }

    // Check if package has active subscriptions
    if (existingPackage.subscriptions.length > 0) {
      return NextResponse.json({ 
        error: 'Cannot delete package with active subscriptions' 
      }, { status: 409 })
    }

    // Delete package
    await prisma.package.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Package deleted successfully' })
  } catch (error) {
    console.error('Error deleting package:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}