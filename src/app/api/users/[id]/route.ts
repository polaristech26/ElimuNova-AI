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

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        schoolAdmin: {
          include: {
            school: {
              select: {
                id: true,
                name: true,
                address: true,
                phone: true,
                email: true
              }
            }
          }
        },
        teacher: {
          include: {
            school: {
              select: {
                id: true,
                name: true,
                address: true,
                phone: true,
                email: true
              }
            }
          }
        },
        student: {
          include: {
            school: {
              select: {
                id: true,
                name: true,
                address: true,
                phone: true,
                email: true
              }
            }
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error('Error fetching user:', error)
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
      firstName, 
      lastName, 
      email, 
      phone, 
      role, 
      schoolId,
      isActive 
    } = body

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id }
    })

    if (!existingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if email is being changed and if it already exists
    if (email && email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email }
      })

      if (emailExists) {
        return NextResponse.json({ error: 'Email already exists' }, { status: 400 })
      }
    }

    // Handle role and school changes
    const currentUser = await prisma.user.findUnique({
      where: { id },
      include: {
        schoolAdmin: true,
        teacher: true,
        student: true
      }
    })

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Update user with transaction to handle role changes
    const user = await prisma.$transaction(async (tx) => {
      // First, remove existing role associations if role is changing
      if (role && role !== currentUser.role) {
        if (currentUser.schoolAdmin) {
          await tx.schoolAdmin.delete({
            where: { userId: id }
          })
        }
        if (currentUser.teacher) {
          await tx.teacher.delete({
            where: { userId: id }
          })
        }
        if (currentUser.student) {
          await tx.student.delete({
            where: { userId: id }
          })
        }
      }

      // Update user basic information
      const updatedUser = await tx.user.update({
        where: { id },
        data: {
          ...(firstName && { firstName }),
          ...(lastName && { lastName }),
          ...(email && { email }),
          ...(phone && { phone }),
          ...(role && { role }),
          ...(isActive !== undefined && { isActive })
        }
      })

      // Create new role association if needed
      if (role && schoolId) {
        if (role === 'SCHOOL_ADMIN') {
          await tx.schoolAdmin.create({
            data: {
              userId: id,
              schoolId
            }
          })
        } else if (role === 'TEACHER') {
          await tx.teacher.create({
            data: {
              userId: id,
              schoolId
            }
          })
        } else if (role === 'STUDENT') {
          await tx.student.create({
            data: {
              userId: id,
              schoolId
            }
          })
        }
      }

      return updatedUser
    })

    // Fetch the updated user with all relations
    const userWithRelations = await prisma.user.findUnique({
      where: { id },
      include: {
        schoolAdmin: {
          include: {
            school: {
              select: {
                id: true,
                name: true
              }
            }
          }
        },
        teacher: {
          include: {
            school: {
              select: {
                id: true,
                name: true
              }
            }
          }
        },
        student: {
          include: {
            school: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      }
    })

    return NextResponse.json(userWithRelations)
  } catch (error) {
    console.error('Error updating user:', error)
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

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id }
    })

    if (!existingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if user is trying to delete themselves
    if (existingUser.id === session.user.id) {
      return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 })
    }

    // Delete user (this will cascade delete related records)
    await prisma.user.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'User deleted successfully' })
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
