import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== 'SCHOOL_ADMIN') {
      return NextResponse.json({ error: 'Forbidden - School admin access required' }, { status: 403 })
    }

    // Get school admin info
    const schoolAdmin = await prisma.schoolAdmin.findUnique({
      where: { userId: session.user.id },
      include: { school: true }
    })

    if (!schoolAdmin?.schoolId) {
      return NextResponse.json({ error: 'School not found' }, { status: 404 })
    }

    const schoolId = schoolAdmin.schoolId

    // Get subscription for pricing info
    const subscription = await prisma.subscription.findFirst({
      where: { schoolId },
      include: { package: true },
      orderBy: { createdAt: 'desc' }
    })

    // In a real implementation, this would fetch from Stripe invoices
    // For now, generate mock invoices based on subscription
    const mockInvoices = []
    if (subscription) {
      const currentDate = new Date()
      
      // Generate last 6 months of invoices
      for (let i = 0; i < 6; i++) {
        const invoiceDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1)
        const period = invoiceDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
        
        mockInvoices.push({
          id: `inv_${Date.now()}_${i}`,
          date: invoiceDate.toISOString(),
          amount: subscription.package.price,
          status: i === 0 ? 'pending' : 'paid',
          period,
          description: `${subscription.package.name} - ${period}`,
          downloadUrl: `/api/school-admin/invoices/inv_${Date.now()}_${i}/download`
        })
      }
    }

    return NextResponse.json({ success: true, invoices: mockInvoices })
  } catch (error) {
    console.error('Error fetching invoices:', error)
    return NextResponse.json(
      { error: 'Failed to fetch invoices' },
      { status: 500 }
    )
  }
}