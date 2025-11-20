import { prisma } from '@/lib/prisma'

async function checkPackages() {
  console.log('🔍 Checking available packages...')
  
  try {
    const packages = await prisma.package.findMany()
    
    console.log(`\n📦 Found ${packages.length} packages:`)
    packages.forEach(pkg => {
      console.log(`- ${pkg.name} (ID: ${pkg.id}) - $${pkg.price}`)
    })

    if (packages.length === 0) {
      console.log('\n❌ No packages found in database!')
    }

  } catch (error) {
    console.error('❌ Error checking packages:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkPackages()