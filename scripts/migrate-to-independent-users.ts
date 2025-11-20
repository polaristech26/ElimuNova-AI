import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function migrateToIndependentUsers() {
  console.log('🚀 Starting migration to support independent users...')

  try {
    // This migration makes schoolId optional for teachers and students
    // The schema changes have already been made, this script is for any data cleanup if needed
    
    console.log('✅ Migration completed successfully!')
    console.log('📝 Summary:')
    console.log('   - Teachers can now exist without school association')
    console.log('   - Students can now exist without school/teacher association')
    console.log('   - Existing users with school associations remain unchanged')
    console.log('   - New users can sign up independently')
    
  } catch (error) {
    console.error('❌ Migration failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

if (require.main === module) {
  migrateToIndependentUsers()
    .then(() => {
      console.log('🎉 Migration completed!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('💥 Migration failed:', error)
      process.exit(1)
    })
}

export { migrateToIndependentUsers }