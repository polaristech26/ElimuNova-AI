import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testBillingSystem() {
  console.log('🧪 Testing billing and subscription system...')
  
  try {
    // Test 1: Check subscription status for different user types
    console.log('\n1. Testing subscription status checks...')
    
    // Independent teacher
    const independentTeacher = await prisma.teacher.findFirst({
      where: { schoolId: null },
      include: { user: true }
    })

    if (independentTeacher) {
      const subscription = await prisma.subscription.findFirst({
        where: { userId: independentTeacher.userId },
        include: { package: true }
      })

      console.log(`✅ Independent teacher ${independentTeacher.user.email}:`)
      if (subscription) {
        const now = new Date()
        const daysRemaining = Math.max(0, Math.ceil((subscription.endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
        
        console.log(`   - Status: ${subscription.status}`)
        console.log(`   - Package: ${subscription.package.name}`)
        console.log(`   - Days remaining: ${daysRemaining}`)
        console.log(`   - Is trial: ${subscription.isTrial}`)
        console.log(`   - End date: ${subscription.endDate.toLocaleDateString()}`)
      } else {
        console.log('   - No subscription found')
      }
    }

    // School-based users
    const schoolTeacher = await prisma.teacher.findFirst({
      where: { schoolId: { not: null } },
      include: { user: true, school: true }
    })

    if (schoolTeacher) {
      const schoolSubscription = await prisma.subscription.findFirst({
        where: { schoolId: schoolTeacher.schoolId },
        include: { package: true }
      })

      console.log(`\n✅ School teacher ${schoolTeacher.user.email} (${schoolTeacher.school?.name}):`)
      if (schoolSubscription) {
        const now = new Date()
        const daysRemaining = Math.max(0, Math.ceil((schoolSubscription.endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
        
        console.log(`   - Status: ${schoolSubscription.status}`)
        console.log(`   - Package: ${schoolSubscription.package.name}`)
        console.log(`   - Days remaining: ${daysRemaining}`)
        console.log(`   - Is trial: ${schoolSubscription.isTrial}`)
        console.log(`   - End date: ${schoolSubscription.endDate.toLocaleDateString()}`)
      } else {
        console.log('   - No school subscription found')
      }
    }

    // Test 2: Check package availability
    console.log('\n2. Testing package availability...')
    const packages = await prisma.package.findMany({
      where: { isActive: true },
      orderBy: { price: 'asc' }
    })

    console.log(`✅ Found ${packages.length} active packages:`)
    packages.forEach(pkg => {
      console.log(`   - ${pkg.name}: $${pkg.price}/month (${pkg.maxTeachers} teachers, ${pkg.maxStudents} students)`)
    })

    // Test 3: Check trial eligibility logic
    console.log('\n3. Testing trial eligibility...')
    
    // New user (created recently)
    const recentUser = await prisma.user.findFirst({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
        }
      },
      include: {
        teacher: true,
        student: true
      }
    })

    if (recentUser) {
      const existingSubscription = await prisma.subscription.findFirst({
        where: recentUser.teacher ? 
          { userId: recentUser.id } : 
          { userId: recentUser.id }
      })

      const daysSinceCreation = Math.floor((Date.now() - recentUser.createdAt.getTime()) / (1000 * 60 * 60 * 24))
      const isTrialEligible = daysSinceCreation <= 7 && !existingSubscription

      console.log(`✅ Recent user ${recentUser.email}:`)
      console.log(`   - Created: ${daysSinceCreation} days ago`)
      console.log(`   - Has subscription: ${!!existingSubscription}`)
      console.log(`   - Trial eligible: ${isTrialEligible}`)
    }

    // Test 4: Check access control logic
    console.log('\n4. Testing access control logic...')
    
    const allSubscriptions = await prisma.subscription.findMany({
      include: { package: true, user: true, school: true }
    })

    console.log(`✅ Access control summary:`)
    allSubscriptions.forEach(sub => {
      const now = new Date()
      const isExpired = sub.endDate < now
      const hasAccess = sub.status === 'ACTIVE' && !isExpired || (sub.status === 'TRIAL' && !isExpired)
      
      const entity = sub.user ? `User: ${sub.user.email}` : `School: ${sub.school?.name}`
      console.log(`   - ${entity}: ${hasAccess ? '✅ HAS ACCESS' : '❌ NO ACCESS'} (${sub.status})`)
    })

    // Test 5: Simulate subscription expiration scenarios
    console.log('\n5. Testing expiration scenarios...')
    
    const trialSubscriptions = await prisma.subscription.findMany({
      where: { isTrial: true },
      include: { package: true }
    })

    console.log(`✅ Trial subscriptions:`)
    trialSubscriptions.forEach(sub => {
      const now = new Date()
      const daysRemaining = Math.max(0, Math.ceil((sub.endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
      
      let alertType = 'NONE'
      if (daysRemaining === 0) alertType = 'EXPIRED'
      else if (daysRemaining <= 1) alertType = 'CRITICAL'
      else if (daysRemaining <= 3) alertType = 'WARNING'
      else if (daysRemaining <= 7) alertType = 'INFO'

      console.log(`   - ${sub.package.name}: ${daysRemaining} days left (Alert: ${alertType})`)
    })

    console.log('\n🎉 Billing system test completed successfully!')
    console.log('\n📊 Summary:')
    console.log(`- Total subscriptions: ${allSubscriptions.length}`)
    console.log(`- Active packages: ${packages.length}`)
    console.log(`- Trial subscriptions: ${trialSubscriptions.length}`)

  } catch (error) {
    console.error('❌ Billing system test failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

testBillingSystem()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })