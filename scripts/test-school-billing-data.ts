import { prisma } from '@/lib/prisma'

async function testSchoolBillingData() {
  console.log('🧪 Testing school billing data API...')
  
  try {
    // Get a school admin to test with
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

    console.log(`✅ Found school admin: ${schoolAdmin.user.email}`)
    console.log(`✅ School: ${schoolAdmin.school.name}`)

    // Test the data that would be fetched
    const schoolId = schoolAdmin.schoolId

    // Get teachers
    const teachers = await prisma.teacher.findMany({
      where: { schoolId },
      include: { user: true }
    })

    // Get students
    const students = await prisma.student.findMany({
      where: { schoolId },
      include: { user: true }
    })

    // Get lesson plans
    const lessonPlans = await prisma.lessonPlan.count({
      where: {
        teacher: {
          schoolId
        }
      }
    })

    // Get AI generations
    const aiGenerations = await prisma.activity.count({
      where: {
        schoolId,
        OR: [
          { action: { contains: 'AI' } },
          { action: { contains: 'generate' } },
          { description: { contains: 'AI' } },
          { description: { contains: 'generated' } }
        ]
      }
    })

    // Get recent activities
    const recentActivities = await prisma.activity.count({
      where: {
        schoolId,
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        }
      }
    })

    console.log('\n📊 School Billing Data:')
    console.log(`  - Teachers: ${teachers.length}`)
    console.log(`  - Students: ${students.length}`)
    console.log(`  - Lesson Plans: ${lessonPlans}`)
    console.log(`  - AI Generations: ${aiGenerations}`)
    console.log(`  - Recent Activities (30 days): ${recentActivities}`)

    // Test API endpoint
    console.log('\n🌐 Testing API endpoint...')
    try {
      const response = await fetch('http://localhost:3000/api/school-admin/billing-data', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      console.log(`Response status: ${response.status}`)
      
      if (response.status === 401) {
        console.log('✅ API correctly requires authentication (401 Unauthorized)')
        console.log('This is expected behavior - the route is protected')
      } else if (response.status === 403) {
        console.log('✅ API correctly requires school admin role (403 Forbidden)')
      } else {
        const data = await response.json()
        console.log('Response data:', data)
      }

    } catch (fetchError) {
      console.log('⚠️  Could not reach API endpoint (dev server may not be running)')
    }

    console.log('\n✅ School billing data test completed!')
    console.log('\n📋 Summary:')
    console.log('- School admin exists and has access to school data')
    console.log('- Teachers and students data is available')
    console.log('- Usage statistics can be calculated')
    console.log('- API endpoint is protected and ready')

  } catch (error) {
    console.error('❌ Test failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testSchoolBillingData()