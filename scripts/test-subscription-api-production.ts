import { prisma } from '@/lib/prisma'
import { getSubscriptionStatus } from '@/lib/subscription-service'

async function testSubscriptionAPIProduction() {
  console.log('🧪 Testing Subscription API for Production Issues...')
  
  try {
    // Test database connection first
    console.log('\n🔌 Testing database connection...')
    const userCount = await prisma.user.count()
    console.log(`✅ Database connected. Found ${userCount} users.`)

    // Get a sample user to test with
    console.log('\n👤 Finding test users...')
    const users = await prisma.user.findMany({
      take: 3,
      include: {
        teacher: {
          select: { schoolId: true }
        },
        student: {
          select: { schoolId: true }
        },
        schoolAdmin: {
          select: { schoolId: true }
        }
      }
    })

    console.log(`✅ Found ${users.length} users for testing`)

    // Test subscription status for each user
    for (const user of users) {
      console.log(`\n🔍 Testing subscription for user: ${user.firstName} ${user.lastName} (${user.role})`)
      
      try {
        let userId: string | undefined
        let schoolId: string | undefined

        // Determine context like the API does
        if (user.role === 'TEACHER' && user.teacher) {
          if (user.teacher.schoolId) {
            schoolId = user.teacher.schoolId
            console.log(`  - School-based teacher, schoolId: ${schoolId}`)
          } else {
            userId = user.id
            console.log(`  - Independent teacher, userId: ${userId}`)
          }
        } else if (user.role === 'STUDENT' && user.student) {
          if (user.student.schoolId) {
            schoolId = user.student.schoolId
            console.log(`  - School-based student, schoolId: ${schoolId}`)
          } else {
            userId = user.id
            console.log(`  - Independent student, userId: ${userId}`)
          }
        } else if (user.role === 'SCHOOL_ADMIN' && user.schoolAdmin) {
          schoolId = user.schoolAdmin.schoolId
          console.log(`  - School admin, schoolId: ${schoolId}`)
        }

        if (!userId && !schoolId) {
          console.log(`  ⚠️  No context found for user ${user.id}`)
          continue
        }

        // Test the subscription service
        const subscriptionInfo = await getSubscriptionStatus(userId, schoolId)
        
        console.log(`  ✅ Subscription Status:`)
        console.log(`     - Status: ${subscriptionInfo.status}`)
        console.log(`     - Package: ${subscriptionInfo.packageName}`)
        console.log(`     - Active: ${subscriptionInfo.isActive}`)
        console.log(`     - Trial: ${subscriptionInfo.isTrial}`)
        console.log(`     - Days Remaining: ${subscriptionInfo.daysRemaining}`)
        console.log(`     - Expired: ${subscriptionInfo.isExpired}`)

      } catch (error) {
        console.error(`  ❌ Error testing user ${user.id}:`, error)
      }
    }

    // Test the actual API endpoint simulation
    console.log('\n🌐 Testing API endpoint logic...')
    
    const testUser = users[0]
    if (testUser) {
      console.log(`Testing with user: ${testUser.firstName} ${testUser.lastName}`)
      
      // Simulate the API logic
      let userId: string | undefined
      let schoolId: string | undefined

      if (testUser.role === 'TEACHER') {
        const teacher = await prisma.teacher.findUnique({
          where: { userId: testUser.id }
        })
        
        if (teacher?.schoolId) {
          schoolId = teacher.schoolId
        } else {
          userId = testUser.id
        }
      }

      console.log(`API would use: userId=${userId}, schoolId=${schoolId}`)
      
      if (userId || schoolId) {
        const result = await getSubscriptionStatus(userId, schoolId)
        console.log('✅ API simulation successful:', {
          subscription: result,
          context: { userId, schoolId, userRole: testUser.role }
        })
      }
    }

    // Check for common issues
    console.log('\n🔍 Checking for common production issues...')
    
    // Check for subscriptions with missing packages
    const subsWithMissingPackages = await prisma.subscription.findMany({
      where: {
        package: null
      },
      take: 5
    })
    
    if (subsWithMissingPackages.length > 0) {
      console.log(`⚠️  Found ${subsWithMissingPackages.length} subscriptions with missing packages`)
    } else {
      console.log('✅ All subscriptions have valid packages')
    }

    // Check for users without proper role relationships
    const teachersWithoutTeacherRecord = await prisma.user.findMany({
      where: {
        role: 'TEACHER',
        teacher: null
      },
      take: 5
    })

    if (teachersWithoutTeacherRecord.length > 0) {
      console.log(`⚠️  Found ${teachersWithoutTeacherRecord.length} teachers without teacher records`)
      teachersWithoutTeacherRecord.forEach(user => {
        console.log(`  - ${user.firstName} ${user.lastName} (${user.id})`)
      })
    } else {
      console.log('✅ All teachers have proper teacher records')
    }

    console.log('\n✅ Subscription API Production Test Completed!')
    
  } catch (error) {
    console.error('❌ Test failed:', error)
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    })
  } finally {
    await prisma.$disconnect()
  }
}

testSubscriptionAPIProduction()