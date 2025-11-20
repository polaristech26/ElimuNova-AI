import { prisma } from '@/lib/prisma'

async function testSchoolAdminPackageIds() {
  console.log('🧪 Testing school admin package IDs...')
  
  try {
    // Get school admin
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

    console.log(`✅ Testing with school admin: ${schoolAdmin.user.email}`)
    console.log(`✅ School: ${schoolAdmin.school.name}`)

    const schoolId = schoolAdmin.schoolId

    // Get current subscription
    const subscription = await prisma.subscription.findFirst({
      where: { schoolId },
      include: { package: true },
      orderBy: { createdAt: 'desc' }
    })

    if (subscription) {
      console.log(`\n📦 Current Subscription:`)
      console.log(`  - Package: ${subscription.package.name}`)
      console.log(`  - Package ID: ${subscription.packageId}`)
      console.log(`  - Subscription ID: ${subscription.id}`)
      console.log(`  - Price: $${subscription.package.price}`)
    }

    // Get available packages for upgrade
    const availablePackages = await prisma.package.findMany({
      where: { isActive: true },
      orderBy: { price: 'asc' }
    })

    console.log(`\n📦 Available Packages:`)
    availablePackages.forEach(pkg => {
      console.log(`  - ${pkg.name}: ${pkg.id} ($${pkg.price})`)
    })

    // Find recommended upgrade package (Growth Plan for schools)
    const upgradePackage = availablePackages.find(pkg => pkg.name === 'Growth Plan') || 
                          availablePackages.find(pkg => pkg.maxTeachers >= 50) ||
                          availablePackages[availablePackages.length - 1]

    if (upgradePackage) {
      console.log(`\n🎯 Recommended Upgrade Package:`)
      console.log(`  - Name: ${upgradePackage.name}`)
      console.log(`  - ID: ${upgradePackage.id}`)
      console.log(`  - Price: $${upgradePackage.price}`)
      console.log(`  - Max Teachers: ${upgradePackage.maxTeachers}`)
      console.log(`  - Max Students: ${upgradePackage.maxStudents}`)
    }

    // Test the specific package IDs used in the billing page
    const testPackageIds = [
      'cmi35uxwd0001q69c8ton56qx', // Growth Plan (fallback)
      upgradePackage?.id
    ].filter(Boolean)

    console.log(`\n🔍 Testing Package IDs:`)
    for (const packageId of testPackageIds) {
      const pkg = await prisma.package.findUnique({
        where: { id: packageId }
      })
      
      if (pkg) {
        console.log(`  ✅ ${packageId}: ${pkg.name} ($${pkg.price})`)
      } else {
        console.log(`  ❌ ${packageId}: NOT FOUND`)
      }
    }

    // Test what the billing data API would return
    console.log(`\n📊 Billing Data API Response Preview:`)
    const mockBillingData = {
      currentSubscription: subscription ? {
        id: subscription.id,
        packageId: subscription.packageId, // This is the correct package ID
        packageName: subscription.package.name,
        price: subscription.package.price
      } : null,
      upgradePackage: upgradePackage ? {
        id: upgradePackage.id, // This is what should be used for upgrade
        name: upgradePackage.name,
        price: upgradePackage.price
      } : null
    }

    console.log(JSON.stringify(mockBillingData, null, 2))

    console.log(`\n✅ Package ID test completed!`)
    console.log(`\n📋 Key Findings:`)
    console.log(`- Current subscription package ID: ${subscription?.packageId || 'None'}`)
    console.log(`- Recommended upgrade package ID: ${upgradePackage?.id || 'None'}`)
    console.log(`- For renewal: Use current package ID (${subscription?.packageId})`)
    console.log(`- For upgrade: Use upgrade package ID (${upgradePackage?.id})`)

  } catch (error) {
    console.error('❌ Test failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testSchoolAdminPackageIds()