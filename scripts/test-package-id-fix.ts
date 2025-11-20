import { prisma } from '@/lib/prisma'

async function testPackageIdFix() {
  console.log('🧪 Testing package ID fix...')
  
  try {
    // Get school admin and subscription
    const schoolAdmin = await prisma.schoolAdmin.findFirst({
      include: { 
        user: true,
        school: true
      }
    })

    if (!schoolAdmin) {
      console.log('❌ No school admin found')
      return
    }

    const schoolId = schoolAdmin.schoolId

    // Get current subscription
    const subscription = await prisma.subscription.findFirst({
      where: { schoolId },
      include: { package: true },
      orderBy: { createdAt: 'desc' }
    })

    if (!subscription) {
      console.log('❌ No subscription found')
      return
    }

    console.log(`✅ Current subscription found:`)
    console.log(`  - Subscription ID: ${subscription.id}`)
    console.log(`  - Package ID: ${subscription.packageId}`)
    console.log(`  - Package Name: ${subscription.package.name}`)

    // Test if the package ID exists
    const packageExists = await prisma.package.findUnique({
      where: { id: subscription.packageId }
    })

    if (packageExists) {
      console.log(`✅ Package ID ${subscription.packageId} exists in database`)
      console.log(`  - Package: ${packageExists.name} ($${packageExists.price})`)
    } else {
      console.log(`❌ Package ID ${subscription.packageId} NOT found in database`)
    }

    // Test the upgrade package
    const availablePackages = await prisma.package.findMany({
      where: { isActive: true },
      orderBy: { price: 'asc' }
    })

    const upgradePackage = availablePackages.find(pkg => pkg.name === 'Growth Plan')

    if (upgradePackage) {
      console.log(`✅ Upgrade package found:`)
      console.log(`  - Package ID: ${upgradePackage.id}`)
      console.log(`  - Package Name: ${upgradePackage.name}`)
      
      const upgradeExists = await prisma.package.findUnique({
        where: { id: upgradePackage.id }
      })
      
      if (upgradeExists) {
        console.log(`✅ Upgrade package ID ${upgradePackage.id} exists in database`)
      }
    }

    // Test the billing page logic
    console.log(`\n🔄 Testing billing page logic:`)
    
    // For trial users (upgrade)
    if (subscription.status === 'TRIAL') {
      const upgradePackageId = upgradePackage?.id || 'cmi35uxwd0001q69c8ton56qx'
      console.log(`  - Trial user upgrade: ${upgradePackageId}`)
    } else {
      // For active users (renewal)
      const renewalPackageId = subscription.packageId || upgradePackage?.id || 'cmi35uxwd0001q69c8ton56qx'
      console.log(`  - Active user renewal: ${renewalPackageId}`)
    }

    // Test API call simulation
    console.log(`\n🌐 Simulating API call:`)
    const testPackageId = subscription.packageId
    
    console.log(`  - Package ID to be sent: ${testPackageId}`)
    console.log(`  - Package exists: ${packageExists ? 'YES' : 'NO'}`)
    console.log(`  - Should work: ${packageExists ? 'YES ✅' : 'NO ❌'}`)

    console.log(`\n✅ Package ID fix test completed!`)
    console.log(`\n📋 Summary:`)
    console.log(`- For renewal: Use currentSubscription.packageId (${subscription.packageId})`)
    console.log(`- For upgrade: Use upgradePackage.id (${upgradePackage?.id})`)
    console.log(`- Both package IDs exist in database: ${packageExists && upgradePackage ? 'YES ✅' : 'NO ❌'}`)

  } catch (error) {
    console.error('❌ Test failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testPackageIdFix()