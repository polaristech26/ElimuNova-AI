import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Fetch single school
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is super admin
    if (session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const school = await prisma.school.findUnique({
      where: { id },
      include: {
        schoolAdmin: {
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
        teachers: {
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
          select: {
            id: true
          }
        },
        subscriptions: {
          where: {
            status: 'ACTIVE'
          },
          include: {
            package: {
              select: {
                name: true,
                price: true
              }
            }
          }
        }
      }
    })

    if (!school) {
      return NextResponse.json({ error: 'School not found' }, { status: 404 })
    }

    return NextResponse.json(school)
  } catch (error) {
    console.error('Error fetching school:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT - Update school
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is super admin
    if (session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { name, address, phone, email, website, isActive } = body

    // Check if school exists
    const existingSchool = await prisma.school.findUnique({
      where: { id }
    })

    if (!existingSchool) {
      return NextResponse.json({ error: 'School not found' }, { status: 404 })
    }

    // Check if name is being changed and if it conflicts with existing school
    if (name && name !== existingSchool.name) {
      const nameConflict = await prisma.school.findFirst({
        where: {
          name: { equals: name.trim(), mode: 'insensitive' },
          id: { not: id }
        }
      })

      if (nameConflict) {
        return NextResponse.json({ 
          error: 'School with this name already exists' 
        }, { status: 400 })
      }
    }

    const updatedSchool = await prisma.school.update({
      where: { id },
      data: {
        ...(name && { name: name.trim() }),
        ...(address && { address: address.trim() }),
        ...(phone !== undefined && { phone: phone?.trim() || null }),
        ...(email !== undefined && { email: email?.trim() || null }),
        ...(website !== undefined && { website: website?.trim() || null }),
        ...(isActive !== undefined && { isActive })
      },
      include: {
        schoolAdmin: {
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
        teachers: {
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
          select: {
            id: true
          }
        },
        subscriptions: {
          where: {
            status: 'ACTIVE'
          },
          include: {
            package: {
              select: {
                name: true,
                price: true
              }
            }
          }
        }
      }
    })

    return NextResponse.json(updatedSchool)
  } catch (error) {
    console.error('Error updating school:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Delete school
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is super admin
    if (session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Check if school exists
    const existingSchool = await prisma.school.findUnique({
      where: { id },
      include: {
        students: true,
        teachers: true,
        subscriptions: {
          where: {
            status: 'ACTIVE'
          }
        }
      }
    })

    if (!existingSchool) {
      return NextResponse.json({ error: 'School not found' }, { status: 404 })
    }

    // Check if school has active subscriptions
    if (existingSchool.subscriptions.length > 0) {
      return NextResponse.json({ 
        error: 'Cannot delete school with active subscriptions. Please cancel subscriptions first.' 
      }, { status: 400 })
    }

    // Check if school has students or teachers
    if (existingSchool.students.length > 0 || existingSchool.teachers.length > 0) {
      return NextResponse.json({ 
        error: 'Cannot delete school with students or teachers. Please remove all users first.' 
      }, { status: 400 })
    }

    await prisma.school.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'School deleted successfully' })
  } catch (error) {
    console.error('Error deleting school:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
