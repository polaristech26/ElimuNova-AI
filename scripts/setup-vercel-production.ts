/**
 * Production Database Setup Script for Vercel Deployment
 * 
 * This script helps set up your production database with:
 * - Running migrations
 * - Creating initial super admin
 * - Setting up default system settings
 * 
 * Usage:
 * DATABASE_URL="your_production_url" npx ts-node scripts/setup-vercel-production.ts
 */

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import readline from 'readline'

const prisma = new PrismaClient()

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

function question(query: string): Promise<string> {
  return new Promise(resolve => rl.question(query, resolve))
}

async function createSuperAdmin() {
  console.log('\n📝 Creating Super Admin User...')
  
  const email = await question('Enter admin email: ')
  const password = await question('Enter admin password (min 8 characters): ')
  const firstName = await question('Enter first name: ')
  const lastName = await question('Enter last name: ')

  if (password.length < 8) {
    throw new Error('Password must be at least 8 characters')
  }

  const hashedPassword = await bcrypt.hash(password, 10)

  const existingUser = await prisma.user.findUnique({
    where: { email }
  })

  if (existingUser) {
    console.log('⚠️  User with this email already exists')
    return existingUser
  }

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      firstName,
      lastName,
      role: 'SUPER_ADMIN',
      isActive: true,
      superAdmin: {
        create: {}
      }
    }
  })

  console.log('✅ Super Admin created successfully!')
  console.log(`   Email: ${user.email}`)
  console.log(`   Name: ${user.firstName} ${user.lastName}`)
  
  return user
}

async function setupSystemSettings(adminId: string) {
  console.log('\n⚙️  Setting up system settings...')

  const defaultSettings = [
    {
      key: 'site_name',
      value: 'ElimuNova AI',
      type: 'string',
      category: 'general',
      description: 'Application name',
      isPublic: true,
      isEditable: true,
      updatedBy: adminId
    },
    {
      key: 'maintenance_mode',
      value: 'false',
      type: 'boolean',
      category: 'general',
      description: 'Enable maintenance mode',
      isPublic: false,
      isEditable: true,
      updatedBy: adminId
    },
    {
      key: 'max_upload_size',
      value: '10485760',
      type: 'number',
      category: 'general',
      description: 'Maximum file upload size in bytes (10MB)',
      isPublic: false,
      isEditable: true,
      updatedBy: adminId
    },
    {
      key: 'session_timeout',
      value: '3600',
      type: 'number',
      category: 'security',
      description: 'Session timeout in seconds (1 hour)',
      isPublic: false,
      isEditable: true,
      updatedBy: adminId
    }
  ]

  for (const setting of defaultSettings) {
    await prisma.systemSettings.upsert({
      where: { key: setting.key },
      update: {},
      create: setting
    })
  }

  console.log('✅ System settings configured')
}

async function createDefaultPaymentMethods() {
  console.log('\n💳 Setting up payment methods...')

  const paymentMethods = [
    { name: 'Bank Transfer', type: 'BANK_TRANSFER', description: 'Direct bank transfer' },
    { name: 'Mobile Money', type: 'MOBILE_MONEY', description: 'M-Pesa, Airtel Money, etc.' },
    { name: 'Credit Card', type: 'CREDIT_CARD', description: 'Visa, Mastercard' },
    { name: 'Cash', type: 'CASH', description: 'Cash payment' }
  ]

  for (const method of paymentMethods) {
    await prisma.paymentMethod.upsert({
      where: { name: method.name },
      update: {},
      create: method
    })
  }

  console.log('✅ Payment methods created')
}

async function createDefaultPackages() {
  console.log('\n📦 Setting up subscription packages...')

  const packages = [
    {
      name: 'Starter',
      description: 'Perfect for small schools',
      price: 5000,
      duration: 30,
      maxTeachers: 5,
      maxStudents: 50,
      features: ['Basic AI Tools', 'Lesson Planning', 'Student Management', 'Email Support']
    },
    {
      name: 'Professional',
      description: 'For growing institutions',
      price: 15000,
      duration: 30,
      maxTeachers: 20,
      maxStudents: 200,
      features: ['All Starter Features', 'Advanced AI Tools', 'Analytics Dashboard', 'Priority Support', 'Custom Branding']
    },
    {
      name: 'Enterprise',
      description: 'For large schools and districts',
      price: 50000,
      duration: 30,
      maxTeachers: 100,
      maxStudents: 1000,
      features: ['All Professional Features', 'Unlimited AI Generation', 'Dedicated Support', 'API Access', 'Custom Integrations']
    }
  ]

  for (const pkg of packages) {
    await prisma.package.upsert({
      where: { name: pkg.name },
      update: {},
      create: pkg
    })
  }

  console.log('✅ Subscription packages created')
}

async function verifyDatabaseConnection() {
  console.log('\n🔍 Verifying database connection...')
  
  try {
    await prisma.$connect()
    console.log('✅ Database connection successful')
    
    // Test query
    const userCount = await prisma.user.count()
    console.log(`   Current users in database: ${userCount}`)
    
    return true
  } catch (error) {
    console.error('❌ Database connection failed:', error)
    return false
  }
}

async function main() {
  console.log('🚀 ElimuNova AI - Production Setup')
  console.log('=====================================\n')

  // Check if DATABASE_URL is set
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL environment variable is not set')
    console.log('\nUsage:')
    console.log('DATABASE_URL="your_production_url" npx ts-node scripts/setup-vercel-production.ts')
    process.exit(1)
  }

  console.log('📊 Database URL:', process.env.DATABASE_URL.replace(/:[^:@]+@/, ':****@'))

  // Verify connection
  const connected = await verifyDatabaseConnection()
  if (!connected) {
    process.exit(1)
  }

  // Ask for confirmation
  const confirm = await question('\n⚠️  This will set up your PRODUCTION database. Continue? (yes/no): ')
  if (confirm.toLowerCase() !== 'yes') {
    console.log('Setup cancelled')
    process.exit(0)
  }

  try {
    // Create super admin
    const admin = await createSuperAdmin()

    // Setup system settings
    await setupSystemSettings(admin.id)

    // Create payment methods
    await createDefaultPaymentMethods()

    // Create packages
    await createDefaultPackages()

    console.log('\n✅ Production setup completed successfully!')
    console.log('\n📝 Next Steps:')
    console.log('1. Deploy your application to Vercel')
    console.log('2. Set environment variables in Vercel dashboard')
    console.log('3. Test the login with your admin credentials')
    console.log('4. Create your first school and users')
    console.log('\n🔐 Admin Login:')
    console.log(`   Email: ${admin.email}`)
    console.log('   Password: (the one you entered)')

  } catch (error) {
    console.error('\n❌ Setup failed:', error)
    process.exit(1)
  } finally {
    rl.close()
    await prisma.$disconnect()
  }
}

main()
