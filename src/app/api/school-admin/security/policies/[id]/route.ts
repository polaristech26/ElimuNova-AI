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

    // Check if user is school admin
    if (session.user.role !== 'SCHOOL_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params

    const policy = await prisma.securityPolicy.findUnique({
      where: { id },
      include: {
        createdByUser: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        },
        updatedByUser: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    })

    if (!policy) {
      return NextResponse.json({ error: 'Security policy not found' }, { status: 404 })
    }

    return NextResponse.json(policy)
  } catch (error) {
    console.error('Error fetching security policy:', error)
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

    // Check if user is school admin
    if (session.user.role !== 'SCHOOL_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()
    const { 
      name,
      description,
      policyType,
      rules,
      isActive,
      priority
    } = body

    // Check if policy exists
    const existingPolicy = await prisma.securityPolicy.findUnique({
      where: { id }
    })

    if (!existingPolicy) {
      return NextResponse.json({ error: 'Security policy not found' }, { status: 404 })
    }

    // Update policy
    const policy = await prisma.securityPolicy.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(policyType && { policyType }),
        ...(rules && { rules: typeof rules === 'string' ? rules : JSON.stringify(rules) }),
        ...(isActive !== undefined && { isActive }),
        ...(priority !== undefined && { priority }),
        updatedBy: session.user.id
      },
      include: {
        createdByUser: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        },
        updatedByUser: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json(policy)
  } catch (error) {
    console.error('Error updating security policy:', error)
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

    // Check if user is school admin
    if (session.user.role !== 'SCHOOL_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params

    // Check if policy exists
    const existingPolicy = await prisma.securityPolicy.findUnique({
      where: { id }
    })

    if (!existingPolicy) {
      return NextResponse.json({ error: 'Security policy not found' }, { status: 404 })
    }

    // Delete policy
    await prisma.securityPolicy.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Security policy deleted successfully' })
  } catch (error) {
    console.error('Error deleting security policy:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
