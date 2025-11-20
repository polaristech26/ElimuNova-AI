import { prisma } from '@/lib/prisma'

async function testDirectSubscription() {
  console.log('🧪 Testing direct subscription query...')
  
  try {
    // Get independent teacher
    const teacher = await prisma.teacher.findFirst({
      where: { schoolId: null },
      include: { user: true }
    })

    if (!teacher) {
      console.log('No independent teacher found')
      return
    }

    console.log(`\n📊 Testing for teacher: ${teacher.user.email}`)

    // Direct database query
    const subscription = await prisma.subscription.findFirst({
      where: { userId: teacher.userId },
      include: {
        package: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    if (subscription) {
      console.log('Direct Database Query Result:')
      console.log(`  - ID: ${subscription.id}`)
      console.log(`  - Status: ${subscription.status}`)
      console.log(`  - Is Trial: ${subscription.isTrial}`)
      console.log(`  - Start Date: ${subscription.startDate.toLocaleDateString()}`)
      console.log(`  - End Date: ${subscription.endDate.toLocaleDateString()}`)
      console.log(`  - Trial Ends At: ${subscription.trialEndsAt?.toLocaleDateString() || 'N/A'}`)
      console.log(`  - Package: ${subscription.package?.name || 'N/A'}`)
      console.log(`  - Amount: $${subscription.amount}`)

      // Calculate days remaining
      const now = new Date()
      const daysRemaining = Math.max(0, Math.ceil((subscription.endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
      console.log(`  - Days Remaining: ${daysRemaining}`)
    } else {
      console.log('No subscription found in database')
    }

    // Test the function
    console.log('\n📊 Testing getSubscriptionStatus function...')
    const { getSubscriptionStatus } = await import('@/lib/subscription-service')
    const result = await getSubscriptionStatus(teacher.userId)
    
    console.log('Function Result:')
    console.log(`  - Status: ${result.status}`)
    console.log(`  - Is Active: ${result.isActive}`)
    console.log(`  - Is Trial: ${result.isTrial}`)
    console.log(`  - Days Remaining: ${result.daysRemaining}`)
    console.log(`  - Package Name: ${result.packageName}`)
    console.log(`  - Trial Ends At: ${result.trialEndsAt?.toLocaleDateString() || 'N/A'}`)
    console.log(`  - End Date: ${result.endDate?.toLocaleDateString() || 'N/A'}`)

  } catch (error) {
    console.error('❌ Test failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testDirectSubscription()