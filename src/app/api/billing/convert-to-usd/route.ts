import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// POST /api/billing/convert-to-usd?rate=0.0077&dryRun=true
// Converts KES-denominated monetary fields to USD using provided rate.
// Aimed at one-time migration; requires SUPER_ADMIN.
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (session.user.role !== 'SUPER_ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { searchParams } = new URL(request.url)
    const rateParam = searchParams.get('rate')
    const dryRun = (searchParams.get('dryRun') || 'true').toLowerCase() === 'true'
    const rate = rateParam ? parseFloat(rateParam) : 1 / 130 // default ~KES->USD
    if (!rate || rate <= 0) return NextResponse.json({ error: 'Invalid rate' }, { status: 400 })

    // Fetch current values
    const [packages, subscriptions, invoices] = await Promise.all([
      prisma.package.findMany({}),
      prisma.subscription.findMany({}),
      prisma.invoice.findMany({}),
    ])

    const converted = {
      packages: packages.map(p => ({ id: p.id, from: p.price, to: +(p.price * rate).toFixed(2) })),
      subscriptions: subscriptions.map(s => ({ id: s.id, from: s.amount, to: +(s.amount * rate).toFixed(2) })),
      invoices: invoices.map(i => ({ id: i.id, from: i.totalAmount, to: +(i.totalAmount * rate).toFixed(2), amountTo: +(i.amount * rate).toFixed(2), taxTo: +(i.taxAmount * rate).toFixed(2) })),
      rate,
      dryRun,
    }

    if (!dryRun) {
      // Apply updates in a transaction
      await prisma.$transaction([
        ...converted.packages.map(p => prisma.package.update({ where: { id: p.id }, data: { price: p.to } })),
        ...converted.subscriptions.map(s => prisma.subscription.update({ where: { id: s.id }, data: { amount: s.to } })),
        ...converted.invoices.map(i => prisma.invoice.update({ where: { id: i.id }, data: { totalAmount: i.to, amount: i.amountTo, taxAmount: i.taxTo } })),
      ])
    }

    return NextResponse.json(converted)
  } catch (error) {
    console.error('Conversion to USD failed:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


