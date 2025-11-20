import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testSubscriptionSystem() {
  console.log('🧪 Testing subscription system...')
  
  try {
    // Test 1: Check if packages exist
    const packages = await prisma.package.findMany()
    console.log(`✅ Found ${packages.length} packages:`)
    packages.forEach(pkg => {
      console.log(`   - ${pkg.name}: $${pkg.price} (${pkg.duration} days)`)
    })

    // Test 2: Check subscriptions
    const subscriptions = await prisma.subscription.findMany({
      include: {
        package: true,
        user: true,
        school: true
      }
    })
    console.log(`\n✅ Found ${subscriptions.length} subscriptions:`)
    subscriptions.forEach(sub => {
      const entity = sub.user ? `User: ${sub.user.email}` : `School: ${sub.school?.name}`
      console.log(`   - ${entity} - ${sub.status} (${sub.package.name})`)
    })

    // Test 3: Check independent teacher subscription
    const independentTeacher = await prisma.teacher.findFirst({
      where: { schoolId: null },
      include: { user: true }
    })

    if (independentTeacher) {
      const subscription = await prisma.subscription.findFirst({
        where: { userId: independentTeacher.userId },
        include: { package: true }
      })

      if (subscription) {
        const now = new Date()
        const isActive = subscription.endDate > now && subscription.status === 'TRIAL'
        console.log(`\n✅ Independent teacher ${independentTeacher.user.email}:`)
        console.log(`   - Status: ${subscription.status}`)
        console.log(`   - Package: ${subscription.package.name}`)
        console.log(`   - Active: ${isActive}`)
        console.log(`   - Ends: ${subscription.endDate.toLocaleDateString()}`)
      } else {
        console.log(`\n❌ No subscription found for independent teacher ${independentTeacher.user.email}`)
      }
    }

    console.log('\n🎉 Subscription system test completed!')

  } catch (error) {
    console.error('❌ Test failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

testSubscriptionSystem()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })