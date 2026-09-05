import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { route } from '@/lib/api-middleware'
import { handlePaymentSuccess } from '@/lib/payment-notifications'
import { invalidateSubscriptionCache } from '@/lib/subscription-service'

export const POST = route({ auth: 'SUPER_ADMIN' }, async (req) => {
  const body = await req.json()
  const { subscriptionId, packageId, freemium } = body

  if (!subscriptionId) {
    return NextResponse.json({ error: 'subscriptionId is required' }, { status: 400 })
  }

  const oldSubscription = await prisma.subscription.findUnique({
    where: { id: subscriptionId },
    include: { package: true }
  })

  if (!oldSubscription) {
    return NextResponse.json({ error: 'Subscription not found' }, { status: 404 })
  }

  const includeForResponse = {
    school: {
      select: {
        id: true, name: true, address: true, phone: true, email: true,
        schoolAdmin: {
          include: {
            user: { select: { firstName: true, lastName: true, email: true } }
          }
        }
      }
    },
    package: {
      select: { id: true, name: true, description: true, price: true, duration: true, features: true }
    }
  }

  // Freemium grant: assigns the free access package and marks the
  // subscription as FREEMIUM (used for senior students / sponsored slots).
  if (freemium === true) {
    let freemiumPkg = await prisma.package.findFirst({
      where: { name: { contains: 'Basic' } }
    })
    if (!freemiumPkg) {
      freemiumPkg = await prisma.package.create({
        data: {
          name: 'Basic Plan',
          price: 9.99,
          duration: 30,
          maxTeachers: 1,
          maxStudents: 5,
          features: ['AI Tutor', 'Progress Tracking', 'Curriculum Access'],
          isActive: true,
        },
      })
    }

    const startDate = new Date()
    const endDate = new Date(startDate)
    endDate.setFullYear(endDate.getFullYear() + 10) // 10-year freemium access

    const freemiumSubscription = await prisma.subscription.update({
      where: { id: oldSubscription.id },
      data: {
        packageId: freemiumPkg.id,
        status: 'ACTIVE',
        type: 'FREEMIUM',
        paymentMethod: 'FREEMIUM',
        amount: 0,
        isFreemium: true,
        isTrial: false,
        startDate,
        endDate,
        trialEndsAt: null,
      },
      include: includeForResponse,
    })

    try {
      await invalidateSubscriptionCache(freemiumSubscription.userId || undefined, freemiumSubscription.schoolId || undefined)
    } catch (err) {
      console.error('Failed to invalidate cache after freemium grant:', err)
    }

    return NextResponse.json({
      message: 'Freemium assigned successfully',
      subscription: freemiumSubscription
    })
  }

  if (!packageId) {
    return NextResponse.json({ error: 'packageId is required' }, { status: 400 })
  }

  const newPackage = await prisma.package.findUnique({
    where: { id: packageId }
  })

  if (!newPackage) {
    return NextResponse.json({ error: 'Package not found' }, { status: 404 })
  }

  const startDate = new Date()
  const durationMs = newPackage.duration * 30 * 24 * 60 * 60 * 1000
  const endDate = new Date(startDate.getTime() + durationMs)

  const newSubscription = await prisma.subscription.create({
    data: {
      schoolId: oldSubscription.schoolId,
      userId: oldSubscription.userId,
      packageId: newPackage.id,
      status: 'ACTIVE',
      startDate,
      endDate,
      amount: newPackage.price,
      isTrial: false,
      isFreemium: oldSubscription.isFreemium ?? false,
      type: 'RENEWAL',
      paymentMethod: 'MANUAL',
    },
    include: includeForResponse,
  })

  // The old subscription is superseded — mark it expired so only the new one
  // is considered active.
  await prisma.subscription.update({
    where: { id: oldSubscription.id },
    data: { status: 'EXPIRED' },
  }).catch(() => {})

  // Record the manual payment as a PAID invoice + notify the school admin.
  try {
    await invalidateSubscriptionCache(oldSubscription.userId || undefined, oldSubscription.schoolId || undefined)
    await handlePaymentSuccess({
      subscriptionId: newSubscription.id,
      amount: newPackage.price,
      method: 'MANUAL',
      receipt: `renew-${newSubscription.id.slice(-8)}`,
      notes: `MANUAL_RENEWAL:${oldSubscription.id}`,
    })
  } catch (err) {
    console.error('Failed to record renewal invoice/notification:', err)
  }

  return NextResponse.json({
    message: 'Subscription renewed successfully',
    subscription: newSubscription
  })
})
