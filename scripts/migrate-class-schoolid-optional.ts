import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔄 Making Class.schoolId optional for independent teachers...')
  
  try {
    // This migration will be handled by Prisma's migration system
    // The schema change has been made, now we need to generate and apply the migration
    console.log('✅ Schema updated. Run the following commands:')
    console.log('1. npx prisma db push')
    console.log('2. npx prisma generate')
    
  } catch (error) {
    console.error('❌ Migration failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })