import { prisma } from '@/lib/prisma'

export interface SubscriptionInfo {
  isActive: boolean
  isTrial: boolean
  isExpired: boolean
  daysRemaining: number
  status: string
  packageName?: string
  trialEndsAt?: Date
  endDate?: Date
}

export async function getSubscriptionStatus(userId?: string, schoolId?: string): Promise<SubscriptionInfo> {
  if (!userId && !schoolId) {
    throw new Error('Either userId or schoolId must be provided')
  }

  try {
    const subscription = await prisma.subscription.findFirst({
      where: {
        ...(userId && { userId }),
        ...(schoolId && { schoolId })
      },
      include: { package: true },
      orderBy: { createdAt: 'desc' }
    })

    if (!subscription) {
      // Check if user/school is eligible for trial
      const user = userId ? await prisma.user.findUnique({ where: { id: userId } }) : null
      const school = schoolId ? await prisma.school.findUnique({ where: { id: schoolId } }) : null
      
      const createdAt = user?.createdAt || school?.createdAt
      if (createdAt) {
        const daysSinceCreation = Math.floor((Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24))
        
        if (daysSinceCreation <= 7) {
          // Still eligible for trial
          const trialEndDate = new Date(createdAt.getTime() + (7 * 24 * 60 * 60 * 1000))
          return {
            isActive: true,
            isTrial: true,
            isExpired: false,
            daysRemaining: 7 - daysSinceCreation,
            status: 'TRIAL_ELIGIBLE',
            packageName: 'Trial Available',
            trialEndsAt: trialEndDate,
            endDate: trialEndDate
          }
        }
      }

      return {
        isActive: false,
        isTrial: false,
        isExpired: true,
        daysRemaining: 0,
        status: 'NO_SUBSCRIPTION',
        packageName: 'None'
      }
    }

    const now = new Date()
    const daysRemaining = Math.max(0, Math.ceil((subscription.endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
    const isExpired = subscription.endDate < now
    
    // Safe status checking with fallback
    const subscriptionStatus = subscription.status as string
    const isActive = (subscriptionStatus === 'ACTIVE' || subscriptionStatus === 'TRIAL') && !isExpired

    return {
      isActive,
      isTrial: (subscription as any).isTrial || subscriptionStatus === 'TRIAL',
      isExpired,
      daysRemaining,
      status: isExpired ? 'EXPIRED' : subscriptionStatus,
      packageName: subscription.package?.name || 'Unknown Package',
      trialEndsAt: (subscription as any).trialEndsAt || undefined,
      endDate: subscription.endDate
    }
  } catch (error) {
    console.error('Error in getSubscriptionStatus:', error)
    console.error('Error details:', {
      userId,
      schoolId,
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
      errorStack: error instanceof Error ? error.stack : undefined
    })
    return {
      isActive: false,
      isTrial: false,
      isExpired: true,
      daysRemaining: 0,
      status: 'ERROR',
      packageName: 'Error'
    }
  }
}

export async function startFreeTrial(userId?: string, schoolId?: string): Promise<void> {
  if (!userId && !schoolId) {
    throw new Error('Either userId or schoolId must be provided')
  }

  const existingSubscription = await prisma.subscription.findFirst({
    where: {
      ...(userId && { userId }),
      ...(schoolId && { schoolId })
    }
  })

  if (existingSubscription) {
    throw new Error('Subscription already exists')
  }

  const basicPackage = await prisma.package.findFirst({
    where: { name: 'Basic' },
    orderBy: { price: 'asc' }
  })

  if (!basicPackage) {
    throw new Error('No basic package found for trial')
  }

  const startDate = new Date()
  const trialEndDate = new Date(startDate.getTime() + (7 * 24 * 60 * 60 * 1000))

  await prisma.subscription.create({
    data: {
      userId,
      schoolId,
      packageId: basicPackage.id,
      status: 'TRIAL' as any,
      startDate,
      endDate: trialEndDate,
      trialEndsAt: trialEndDate,
      amount: 0,
      isTrial: true,
      type: 'TRIAL',
      paymentMethod: 'FREE_TRIAL'
    }
  })
}

export async function hasAccess(userId?: string, schoolId?: string): Promise<boolean> {
  try {
    const subscriptionInfo = await getSubscriptionStatus(userId, schoolId)
    return subscriptionInfo.isActive
  } catch (error) {
    console.error('Error in hasAccess:', error)
    return false
  }
}
// Create Stripe customer
export async function createStripeCustomer(email: string, name: string, userId?: string, schoolId?: string) {
  const { stripe } = await import('@/lib/stripe')
  
  const customer = await stripe.customers.create({
    email,
    name,
    metadata: {
      userId: userId || '',
      schoolId: schoolId || '',
      type: userId ? 'independent' : 'school'
    }
  })

  return customer
}

// Create checkout session for subscription
export async function createCheckoutSession(
  packageId: string,
  successUrl: string,
  cancelUrl: string,
  userId?: string,
  schoolId?: string
) {
  const { stripe } = await import('@/lib/stripe')
  
  // Get package details
  const packageInfo = await prisma.package.findUnique({
    where: { id: packageId }
  })

  if (!packageInfo) {
    throw new Error('Package not found')
  }

  // Create or get customer
  const customerEmail = userId ? 
    (await prisma.user.findUnique({ where: { id: userId } }))?.email :
    (await prisma.school.findUnique({ where: { id: schoolId! } }))?.email

  if (!customerEmail) {
    throw new Error('Customer email not found')
  }

  const customer = await createStripeCustomer(
    customerEmail,
    userId ? 'Independent User' : 'School',
    userId,
    schoolId
  )

  // Create checkout session
  const session = await stripe.checkout.sessions.create({
    customer: customer.id,
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: packageInfo.name,
            description: packageInfo.description || undefined,
          },
          unit_amount: Math.round(packageInfo.price * 100), // Convert to cents
          recurring: {
            interval: 'month',
            interval_count: Math.ceil(packageInfo.duration / 30),
          },
        },
        quantity: 1,
      },
    ],
    mode: 'subscription',
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      packageId,
      userId: userId || '',
      schoolId: schoolId || ''
    }
  })

  return session
}