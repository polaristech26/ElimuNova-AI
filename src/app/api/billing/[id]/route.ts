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

    const subscription = await prisma.subscription.findUnique({
      where: { id },
      include: {
        school: {
          select: {
            id: true,
            name: true,
            address: true,
            phone: true,
            email: true,
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
            }
          }
        },
        package: {
          select: {
            id: true,
            name: true,
            description: true,
            price: true,
            duration: true,
            features: true
          }
        }
      }
    })

    if (!subscription) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 })
    }

    return NextResponse.json(subscription)
  } catch (error) {
    console.error('Error fetching subscription:', error)
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
      schoolId, 
      packageId, 
      startDate, 
      endDate,
      amount,
      status,
      type,
      paymentMethod,
      transactionId,
      notes
    } = body

    // Check if subscription exists
    const existingSubscription = await prisma.subscription.findUnique({
      where: { id }
    })

    if (!existingSubscription) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 })
    }

    // Update subscription
    const subscription = await prisma.subscription.update({
      where: { id },
      data: {
        ...(schoolId && { schoolId }),
        ...(packageId && { packageId }),
        ...(startDate && { startDate: new Date(startDate) }),
        ...(endDate && { endDate: new Date(endDate) }),
        ...(amount && { amount }),
        ...(status && { status }),
        ...(type && { type }),
        ...(paymentMethod && { paymentMethod }),
        ...(transactionId && { transactionId }),
        ...(notes !== undefined && { notes })
      },
      include: {
        school: {
          select: {
            id: true,
            name: true,
            address: true,
            phone: true,
            email: true,
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
            }
          }
        },
        package: {
          select: {
            id: true,
            name: true,
            description: true,
            price: true,
            duration: true,
            features: true
          }
        }
      }
    })

    return NextResponse.json(subscription)
  } catch (error) {
    console.error('Error updating subscription:', error)
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

    // Check if subscription exists
    const existingSubscription = await prisma.subscription.findUnique({
      where: { id }
    })

    if (!existingSubscription) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 })
    }

    // Delete subscription
    await prisma.subscription.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Subscription deleted successfully' })
  } catch (error) {
    console.error('Error deleting subscription:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
