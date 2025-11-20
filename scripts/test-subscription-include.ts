import { prisma } from '@/lib/prisma'

async function testSubscriptionInclude() {
  try {
    console.log('Testing subscription include with user...')
    
    const subscription = await prisma.subscription.findFirst({
      include: {
        school: {
          select: { name: true }
        },
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        },
        package: {
          select: { name: true }
        }
      }
    })
    
    console.log('✅ Include works! Subscription:', {
      id: subscription?.id,
      school: subscription?.school?.name,
      user: subscription?.user ? `${subscription.user.firstName} ${subscription.user.lastName}` : null,
      package: subscription?.package?.name,
      status: subscription?.status
    })
    
  } catch (error) {
    console.error('❌ Include failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testSubscriptionInclude()