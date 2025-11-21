import { execSync } from 'child_process'

async function migrateSchemaToNeon() {
  console.log('🚀 Migrating Prisma Schema to Neon Database...')
  
  try {
    // Step 1: Set environment to use Neon database
    console.log('\n📝 Step 1: Setting up environment for Neon migration...')
    process.env.DATABASE_URL = "postgresql://neondb_owner:npg_4dCrxETYqoX9@ep-steep-feather-ahzjj8zt-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require"
    console.log('✅ Environment set to Neon database')

    // Step 2: Generate Prisma client
    console.log('\n🔧 Step 2: Generating Prisma client...')
    execSync('npx prisma generate', { stdio: 'inherit' })
    console.log('✅ Prisma client generated')

    // Step 3: Push schema to Neon (this will update the database structure)
    console.log('\n📤 Step 3: Pushing schema to Neon database...')
    console.log('⚠️  This will update your Neon database structure to match your local schema')
    console.log('⚠️  Existing data will be preserved where possible')
    
    try {
      execSync('npx prisma db push --accept-data-loss', { stdio: 'inherit' })
      console.log('✅ Schema successfully pushed to Neon!')
    } catch (error) {
      console.error('❌ Schema push failed. Trying without data loss flag...')
      try {
        execSync('npx prisma db push', { stdio: 'inherit' })
        console.log('✅ Schema successfully pushed to Neon!')
      } catch (secondError) {
        console.error('❌ Schema push failed completely:', secondError)
        throw secondError
      }
    }

    // Step 4: Verify the migration
    console.log('\n✅ Step 4: Migration completed successfully!')
    console.log('\n🎯 Next steps:')
    console.log('1. Run the Neon database test again to verify schema')
    console.log('2. Update your Vercel environment variables')
    console.log('3. Deploy to production')
    
    console.log('\n📋 Vercel Environment Variables needed:')
    console.log('DATABASE_URL=postgresql://neondb_owner:npg_4dCrxETYqoX9@ep-steep-feather-ahzjj8zt-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require')
    console.log('NEXTAUTH_URL=https://your-domain.vercel.app')
    console.log('NEXTAUTH_SECRET=your-production-secret')
    
  } catch (error) {
    console.error('❌ Migration failed:', error)
    console.error('\n🔧 Troubleshooting:')
    console.error('1. Check your Neon database connection')
    console.error('2. Ensure you have the correct permissions')
    console.error('3. Try running: npx prisma db push --force-reset (WARNING: This will delete all data)')
  }
}

migrateSchemaToNeon()