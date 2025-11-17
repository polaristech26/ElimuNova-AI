import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const email = 'admin@edugenius.ai'
  
  console.log('🔍 Checking user:', email)
  
  const user = await prisma.user.findUnique({
    where: { email }
  })
  
  if (!user) {
    console.log('❌ User not found in database')
    
    // List all users
    const allUsers = await prisma.user.findMany({
      select: {
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true
      }
    })
    
    console.log('\n📋 All users in database:')
    allUsers.forEach(u => {
      console.log(`   - ${u.email} (${u.firstName} ${u.lastName}) - ${u.role} - Active: ${u.isActive}`)
    })
    
    return
  }
  
  console.log('✅ User found!')
  console.log('   Email:', user.email)
  console.log('   Name:', user.firstName, user.lastName)
  console.log('   Role:', user.role)
  console.log('   Active:', user.isActive)
  console.log('   Password hash:', user.password.substring(0, 20) + '...')
  
  // Test password
  const testPassword = 'password123'
  const isValid = await bcrypt.compare(testPassword, user.password)
  console.log(`\n🔐 Password "${testPassword}" is ${isValid ? '✅ VALID' : '❌ INVALID'}`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
