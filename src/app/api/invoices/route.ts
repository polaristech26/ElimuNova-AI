import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is super admin or school admin
    if (session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'SCHOOL_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''
    const schoolId = searchParams.get('schoolId') || ''

    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}
    
    // For school admins, filter by their school
    if (session.user.role === 'SCHOOL_ADMIN') {
      // Get the school admin's school ID
      const schoolAdmin = await prisma.schoolAdmin.findFirst({
        where: { userId: session.user.id },
        select: { schoolId: true }
      })
      
      if (!schoolAdmin) {
        return NextResponse.json({ error: 'School admin not found' }, { status: 404 })
      }
      
      where.subscription = {
        schoolId: schoolAdmin.schoolId
      }
    } else if (schoolId) {
      // For super admins, allow filtering by schoolId
      where.subscription = {
        schoolId
      }
    }
    
    if (search) {
      where.OR = [
        { invoiceNumber: { contains: search, mode: 'insensitive' } },
        { notes: { contains: search, mode: 'insensitive' } }
      ]
    }
    
    if (status) {
      where.status = status
    }

    // Get invoices with pagination
    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder as 'asc' | 'desc' },
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
      }),
      prisma.invoice.count({ where })
    ])

    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      invoices,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    })
  } catch (error) {
    console.error('Error fetching invoices:', error)
    return NextResponse.json(
      { error: 'Failed to fetch invoices' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { 
      subscriptionId, 
      amount, 
      taxAmount = 0, 
      dueDate, 
      paymentMethodId, 
      notes 
    } = body

    // Validate required fields
    if (!subscriptionId || !amount || !dueDate) {
      return NextResponse.json(
        { error: 'Subscription ID, amount, and due date are required' },
        { status: 400 }
      )
    }

    // Check if subscription exists
    const subscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
      include: {
        school: true,
        package: true
      }
    })

    if (!subscription) {
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404 }
      )
    }

    // Generate invoice number
    const invoiceCount = await prisma.invoice.count()
    const invoiceNumber = `INV-${String(invoiceCount + 1).padStart(6, '0')}`

    const totalAmount = amount + taxAmount

    // Create invoice
    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        subscriptionId,
        amount,
        taxAmount,
        totalAmount,
        dueDate: new Date(dueDate),
        paymentMethodId,
        notes
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

    return NextResponse.json(invoice, { status: 201 })
  } catch (error) {
    console.error('Error creating invoice:', error)
    return NextResponse.json(
      { error: 'Failed to create invoice' },
      { status: 500 }
    )
  }
}
