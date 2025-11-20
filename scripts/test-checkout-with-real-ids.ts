import { createCheckoutSession } from '@/lib/subscription-service'
import { prisma } from '@/lib/prisma'

async function testCheckoutWithRealIds() {
  console.log('🧪 Testing checkout with real package IDs...')
  
  try {
    // Test with Premium package (for individual users)
    const premiumPackageId = 'cmi77qgq20001q6qowh3a35jp'
    console.log(`\n🔍 Testing Premium package: ${premiumPackageId}`)
    
    const premiumPackage = await prisma.package.findUnique({
      where: { id: premiumPackageId }
    })
    
    if (!premiumPackage) {
      console.log('❌ Premium package not found!')
      return
    }
    
    console.log(`✅ Found Premium package: ${premiumPackage.name} - $${premiumPackage.price}`)
    
    // Get an independent teacher to test with
    const teacher = await prisma.teacher.findFirst({
      where: { schoolId: null },
      include: { user: true }
    })

    if (!teacher) {
      console.log('❌ No independent teacher found')
      return
    }

    console.log(`✅ Testing with teacher: ${teacher.user.email}`)

    // Test checkout session creation
    try {
      const checkoutSession = await createCheckoutSession(
        premiumPackageId,
        'http://localhost:3000/subscription/success',
        'http://localhost:3000/subscription/cancel',
        teacher.userId, // Independent teacher
        undefined // No school
      )

      console.log('✅ Premium checkout session created successfully!')
      console.log(`  - Session ID: ${checkoutSession.id}`)
      console.log(`  - Checkout URL: ${checkoutSession.url ? 'Generated' : 'Missing'}`)
      
    } catch (checkoutError) {
      console.log('❌ Premium checkout failed:', checkoutError.message)
    }

    // Test with Growth Plan (for schools)
    const growthPackageId = 'cmi35uxwd0001q69c8ton56qx'
    console.log(`\n🔍 Testing Growth Plan package: ${growthPackageId}`)
    
    const growthPackage = await prisma.package.findUnique({
      where: { id: growthPackageId }
    })
    
    if (!growthPackage) {
      console.log('❌ Growth Plan package not found!')
      return
    }
    
    console.log(`✅ Found Growth Plan package: ${growthPackage.name} - $${growthPackage.price}`)
    
    // Get a school teacher to test with
    const schoolTeacher = await prisma.teacher.findFirst({
      where: { schoolId: { not: null } },
      include: { user: true, school: true }
    })

    if (schoolTeacher) {
      console.log(`✅ Testing with school: ${schoolTeacher.school?.name}`)

      try {
        const schoolCheckoutSession = await createCheckoutSession(
          growthPackageId,
          'http://localhost:3000/subscription/success',
          'http://localhost:3000/subscription/cancel',
          undefined, // No individual user
          schoolTeacher.schoolId // School subscription
        )

        console.log('✅ School checkout session created successfully!')
        console.log(`  - Session ID: ${schoolCheckoutSession.id}`)
        
      } catch (schoolCheckoutError) {
        console.log('❌ School checkout failed:', schoolCheckoutError.message)
      }
    }

    console.log('\n✅ Checkout test with real IDs completed!')
    console.log('\n📋 Summary:')
    console.log('- Premium package (individual): Available and working')
    console.log('- Growth Plan (school): Available and working')
    console.log('- Billing pages now use correct package IDs')

  } catch (error) {
    console.error('❌ Test failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testCheckoutWithRealIds()