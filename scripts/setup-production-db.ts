/**
 * Production Database Setup Script
 * 
 * This script helps set up and verify your production database connection
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function setupProductionDatabase() {
  console.log('🚀 Setting up production database...\n')

  try {
    // Test connection
    console.log('1️⃣ Testing database connection...')
    await prisma.$connect()
    console.log('✅ Database connection successful!\n')

    // Check if tables exist
    console.log('2️⃣ Checking database schema...')
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `
    console.log('📊 Found tables:', tables)
    console.log('')

    // Count existing records
    console.log('3️⃣ Checking existing data...')
    const userCount = await prisma.user.count()
    const schoolCount = await prisma.school.count()
    const teacherCount = await prisma.teacher.count()
    const studentCount = await prisma.student.count()
    const classCount = await prisma.class.count()
    const assignmentCount = await prisma.assignment.count()
    const messageCount = await prisma.message.count()

    console.log(`   Users: ${userCount}`)
    console.log(`   Schools: ${schoolCount}`)
    console.log(`   Teachers: ${teacherCount}`)
    console.log(`   Students: ${studentCount}`)
    console.log(`   Classes: ${classCount}`)
    console.log(`   Assignments: ${assignmentCount}`)
    console.log(`   Messages: ${messageCount}`)
    console.log('')

    if (userCount === 0) {
      console.log('⚠️  Database is empty. You may want to:')
      console.log('   1. Run migrations: npx prisma migrate deploy')
      console.log('   2. Seed initial data: npx prisma db seed')
      console.log('')
    } else {
      console.log('✅ Database has existing data')
      console.log('')
    }

    // Database info
    console.log('4️⃣ Database Information:')
    const dbInfo = await prisma.$queryRaw`SELECT version()`
    console.log('   PostgreSQL Version:', dbInfo)
    console.log('')

    console.log('✅ Production database setup complete!')
    console.log('')
    console.log('Next steps:')
    console.log('1. If tables are missing, run: npx prisma migrate deploy')
    console.log('2. If you need test data, run: npx prisma db seed')
    console.log('3. Update your production environment variables')
    console.log('4. Deploy your application')

  } catch (error) {
    console.error('❌ Error setting up production database:', error)
    console.log('')
    console.log('Troubleshooting:')
    console.log('1. Check your DATABASE_URL in .env.production')
    console.log('2. Ensure your IP is whitelisted')
    console.log('3. Verify SSL mode is correct')
    console.log('4. Check database credentials')
  } finally {
    await prisma.$disconnect()
  }
}

setupProductionDatabase()
