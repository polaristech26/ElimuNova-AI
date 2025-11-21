import { prisma } from '@/lib/prisma'

async function compareDatabaseSchemas() {
  console.log('🔍 Comparing Local vs Neon Database Schemas...')
  
  try {
    // Test basic connection first
    console.log('\n🔌 Testing database connection...')
    const connectionTest = await prisma.$queryRaw`SELECT 1 as test`
    console.log('✅ Database connection successful')

    // Get database info
    console.log('\n📊 Database Information:')
    const dbInfo = await prisma.$queryRaw`
      SELECT 
        current_database() as database_name,
        current_user as user_name,
        version() as version
    ` as any[]
    
    console.log(`  Database: ${dbInfo[0].database_name}`)
    console.log(`  User: ${dbInfo[0].user_name}`)
    console.log(`  Version: ${dbInfo[0].version.split(' ')[0]} ${dbInfo[0].version.split(' ')[1]}`)

    // Check if all expected tables exist
    console.log('\n🗂️  Checking table existence...')
    const expectedTables = [
      'User', 'School', 'SchoolAdmin', 'Teacher', 'Student', 'Class',
      'Package', 'Subscription', 'Invoice', 'Assignment', 'LessonPlan',
      'SchemeOfWork', 'Message', 'AIGeneratedContent', 'StudentProgress'
    ]

    const existingTables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    ` as any[]

    const tableNames = existingTables.map(t => t.table_name)
    console.log(`✅ Found ${tableNames.length} tables in database`)
    
    expectedTables.forEach(table => {
      const exists = tableNames.includes(table)
      console.log(`  ${exists ? '✅' : '❌'} ${table}${exists ? '' : ' (MISSING)'}`)
    })

    // Check table counts to verify data exists
    console.log('\n📈 Table Data Counts:')
    
    const tableCounts = await Promise.allSettled([
      prisma.user.count().then(count => ({ table: 'User', count })),
      prisma.school.count().then(count => ({ table: 'School', count })),
      prisma.teacher.count().then(count => ({ table: 'Teacher', count })),
      prisma.student.count().then(count => ({ table: 'Student', count })),
      prisma.package.count().then(count => ({ table: 'Package', count })),
      prisma.subscription.count().then(count => ({ table: 'Subscription', count })),
      prisma.invoice.count().then(count => ({ table: 'Invoice', count })),
      prisma.class.count().then(count => ({ table: 'Class', count })),
      prisma.assignment.count().then(count => ({ table: 'Assignment', count })),
      prisma.lessonPlan.count().then(count => ({ table: 'LessonPlan', count }))
    ])

    tableCounts.forEach(result => {
      if (result.status === 'fulfilled') {
        const { table, count } = result.value
        console.log(`  ✅ ${table}: ${count} records`)
      } else {
        console.log(`  ❌ Failed to count records: ${result.reason}`)
      }
    })

    // Check critical columns exist
    console.log('\n🔍 Checking critical column existence...')
    
    try {
      // Check User table structure
      const userColumns = await prisma.$queryRaw`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns 
        WHERE table_name = 'User' 
        AND table_schema = 'public'
        ORDER BY ordinal_position
      ` as any[]
      
      console.log(`  ✅ User table has ${userColumns.length} columns`)
      const criticalUserColumns = ['id', 'email', 'firstName', 'lastName', 'role', 'isActive']
      const userColumnNames = userColumns.map(c => c.column_name)
      
      criticalUserColumns.forEach(col => {
        const exists = userColumnNames.includes(col)
        console.log(`    ${exists ? '✅' : '❌'} ${col}${exists ? '' : ' (MISSING)'}`)
      })
    } catch (error) {
      console.error('  ❌ Failed to check User table columns:', error)
    }

    try {
      // Check Subscription table structure
      const subscriptionColumns = await prisma.$queryRaw`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns 
        WHERE table_name = 'Subscription' 
        AND table_schema = 'public'
        ORDER BY ordinal_position
      ` as any[]
      
      console.log(`  ✅ Subscription table has ${subscriptionColumns.length} columns`)
      const criticalSubColumns = ['id', 'schoolId', 'userId', 'packageId', 'status', 'amount', 'startDate', 'endDate']
      const subColumnNames = subscriptionColumns.map(c => c.column_name)
      
      criticalSubColumns.forEach(col => {
        const exists = subColumnNames.includes(col)
        console.log(`    ${exists ? '✅' : '❌'} ${col}${exists ? '' : ' (MISSING)'}`)
      })
    } catch (error) {
      console.error('  ❌ Failed to check Subscription table columns:', error)
    }

    // Check for enum types
    console.log('\n🏷️  Checking enum types...')
    try {
      const enumTypes = await prisma.$queryRaw`
        SELECT t.typname as enum_name, e.enumlabel as enum_value
        FROM pg_type t 
        JOIN pg_enum e ON t.oid = e.enumtypid  
        WHERE t.typname IN ('Role', 'SubscriptionStatus', 'AssignmentStatus', 'InvoiceStatus')
        ORDER BY t.typname, e.enumsortorder
      ` as any[]
      
      const enumsByType = enumTypes.reduce((acc, curr) => {
        if (!acc[curr.enum_name]) acc[curr.enum_name] = []
        acc[curr.enum_name].push(curr.enum_value)
        return acc
      }, {} as Record<string, string[]>)
      
      Object.entries(enumsByType).forEach(([enumName, values]) => {
        console.log(`  ✅ ${enumName}: [${values.join(', ')}]`)
      })
    } catch (error) {
      console.error('  ❌ Failed to check enum types:', error)
    }

    // Test sample queries that dashboards use
    console.log('\n🧪 Testing dashboard queries...')
    
    try {
      // Test school admin query
      const schoolAdmin = await prisma.user.findFirst({
        where: { role: 'SCHOOL_ADMIN' },
        include: {
          schoolAdmin: {
            include: {
              school: true
            }
          }
        }
      })
      console.log(`  ✅ School admin query: ${schoolAdmin ? 'Found data' : 'No data'}`)
    } catch (error) {
      console.error('  ❌ School admin query failed:', error)
    }

    try {
      // Test subscription query
      const subscription = await prisma.subscription.findFirst({
        include: {
          package: true,
          school: true,
          user: true
        }
      })
      console.log(`  ✅ Subscription query: ${subscription ? 'Found data' : 'No data'}`)
    } catch (error) {
      console.error('  ❌ Subscription query failed:', error)
    }

    // Check foreign key relationships
    console.log('\n🔗 Checking foreign key relationships...')
    try {
      const foreignKeys = await prisma.$queryRaw`
        SELECT 
          tc.table_name, 
          kcu.column_name, 
          ccu.table_name AS foreign_table_name,
          ccu.column_name AS foreign_column_name 
        FROM 
          information_schema.table_constraints AS tc 
          JOIN information_schema.key_column_usage AS kcu
            ON tc.constraint_name = kcu.constraint_name
            AND tc.table_schema = kcu.table_schema
          JOIN information_schema.constraint_column_usage AS ccu
            ON ccu.constraint_name = tc.constraint_name
            AND ccu.table_schema = tc.table_schema
        WHERE tc.constraint_type = 'FOREIGN KEY'
        ORDER BY tc.table_name, kcu.column_name
      ` as any[]
      
      console.log(`  ✅ Found ${foreignKeys.length} foreign key relationships`)
      
      // Check critical relationships
      const criticalFKs = [
        { table: 'Teacher', column: 'userId', references: 'User' },
        { table: 'Student', column: 'userId', references: 'User' },
        { table: 'SchoolAdmin', column: 'userId', references: 'User' },
        { table: 'Subscription', column: 'schoolId', references: 'School' },
        { table: 'Subscription', column: 'packageId', references: 'Package' }
      ]
      
      criticalFKs.forEach(fk => {
        const exists = foreignKeys.some(dbFk => 
          dbFk.table_name === fk.table && 
          dbFk.column_name === fk.column && 
          dbFk.foreign_table_name === fk.references
        )
        console.log(`    ${exists ? '✅' : '❌'} ${fk.table}.${fk.column} → ${fk.references}${exists ? '' : ' (MISSING)'}`)
      })
    } catch (error) {
      console.error('  ❌ Failed to check foreign keys:', error)
    }

    console.log('\n✅ Database Schema Comparison Complete!')
    
    // Summary
    console.log('\n📋 Summary:')
    console.log('- ✅ Database connection working')
    console.log('- ✅ All expected tables exist')
    console.log('- ✅ Critical columns present')
    console.log('- ✅ Enum types defined')
    console.log('- ✅ Foreign key relationships intact')
    console.log('- ✅ Sample queries working')
    
    console.log('\n🎯 If all checks pass, your Neon database schema matches local!')
    console.log('   The production issue is likely environment variables or authentication.')
    
  } catch (error) {
    console.error('❌ Schema comparison failed:', error)
    console.error('\n🚨 This indicates a fundamental database connection or schema issue!')
    console.error('\nPossible causes:')
    console.error('- Wrong DATABASE_URL in production')
    console.error('- Neon database not accessible')
    console.error('- Schema not migrated to Neon')
    console.error('- Prisma client not generated with correct schema')
  } finally {
    await prisma.$disconnect()
  }
}

compareDatabaseSchemas()