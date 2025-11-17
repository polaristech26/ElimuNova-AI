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
    if (!session || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const paymentMethod = await prisma.paymentMethod.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            subscriptions: true,
            invoices: true
          }
        }
      }
    })

    if (!paymentMethod) {
      return NextResponse.json(
        { error: 'Payment method not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(paymentMethod)
  } catch (error) {
    console.error('Error fetching payment method:', error)
    return NextResponse.json(
      { error: 'Failed to fetch payment method' },
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
    if (!session || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { name, type, description, isActive } = body

    // Check if payment method exists
    const existingPaymentMethod = await prisma.paymentMethod.findUnique({
      where: { id }
    })

    if (!existingPaymentMethod) {
      return NextResponse.json(
        { error: 'Payment method not found' },
        { status: 404 }
      )
    }

    // Update payment method
    const updatedPaymentMethod = await prisma.paymentMethod.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(type && { type }),
        ...(description !== undefined && { description }),
        ...(isActive !== undefined && { isActive })
      }
    })

    return NextResponse.json(updatedPaymentMethod)
  } catch (error) {
    console.error('Error updating payment method:', error)
    return NextResponse.json(
      { error: 'Failed to update payment method' },
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
    if (!session || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Check if payment method exists
    const existingPaymentMethod = await prisma.paymentMethod.findUnique({
      where: { id },
      include: {
        subscriptions: {
          where: { status: 'ACTIVE' }
        },
        invoices: {
          where: { status: 'PENDING' }
        }
      }
    })

    if (!existingPaymentMethod) {
      return NextResponse.json(
        { error: 'Payment method not found' },
        { status: 404 }
      )
    }

    // Check if payment method is in use
    if (existingPaymentMethod.subscriptions.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete payment method that is in use by active subscriptions' },
        { status: 400 }
      )
    }

    if (existingPaymentMethod.invoices.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete payment method that has pending invoices' },
        { status: 400 }
      )
    }

    // Delete payment method
    await prisma.paymentMethod.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Payment method deleted successfully' })
  } catch (error) {
    console.error('Error deleting payment method:', error)
    return NextResponse.json(
      { error: 'Failed to delete payment method' },
      { status: 500 }
    )
  }
}
