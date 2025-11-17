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

    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        subscription: {
          include: {
            school: {
              select: {
                id: true,
                name: true,
                email: true,
                address: true,
                phone: true
              }
            },
            package: {
              select: {
                id: true,
                name: true,
                price: true,
                description: true
              }
            }
          }
        },
        paymentMethod: {
          select: {
            id: true,
            name: true,
            type: true
          }
        }
      }
    })

    if (!invoice) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(invoice)
  } catch (error) {
    console.error('Error fetching invoice:', error)
    return NextResponse.json(
      { error: 'Failed to fetch invoice' },
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
    const { 
      amount, 
      taxAmount, 
      totalAmount, 
      status, 
      dueDate, 
      paidDate, 
      paymentMethodId, 
      notes 
    } = body

    // Check if invoice exists
    const existingInvoice = await prisma.invoice.findUnique({
      where: { id }
    })

    if (!existingInvoice) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      )
    }

    // Update invoice
    const updatedInvoice = await prisma.invoice.update({
      where: { id },
      data: {
        ...(amount !== undefined && { amount }),
        ...(taxAmount !== undefined && { taxAmount }),
        ...(totalAmount !== undefined && { totalAmount }),
        ...(status && { status }),
        ...(dueDate && { dueDate: new Date(dueDate) }),
        ...(paidDate && { paidDate: new Date(paidDate) }),
        ...(paymentMethodId && { paymentMethodId }),
        ...(notes !== undefined && { notes })
      },
      include: {
        subscription: {
          include: {
            school: {
              select: {
                id: true,
                name: true,
                email: true
              }
            },
            package: {
              select: {
                id: true,
                name: true,
                price: true
              }
            }
          }
        },
        paymentMethod: {
          select: {
            id: true,
            name: true,
            type: true
          }
        }
      }
    })

    return NextResponse.json(updatedInvoice)
  } catch (error) {
    console.error('Error updating invoice:', error)
    return NextResponse.json(
      { error: 'Failed to update invoice' },
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

    // Check if invoice exists
    const existingInvoice = await prisma.invoice.findUnique({
      where: { id }
    })

    if (!existingInvoice) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      )
    }

    // Check if invoice is already paid
    if (existingInvoice.status === 'PAID') {
      return NextResponse.json(
        { error: 'Cannot delete paid invoice' },
        { status: 400 }
      )
    }

    // Delete invoice
    await prisma.invoice.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Invoice deleted successfully' })
  } catch (error) {
    console.error('Error deleting invoice:', error)
    return NextResponse.json(
      { error: 'Failed to delete invoice' },
      { status: 500 }
    )
  }
}
