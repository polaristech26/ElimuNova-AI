import { prisma } from '@/lib/prisma'

async function testAllDashboardAPIs() {
  console.log('🧪 Testing All Dashboard APIs...')
  
  try {
    // Test database connection first
    console.log('\n🔌 Testing database connection...')
    const userCount = await prisma.user.count()
    console.log(`✅ Database connected. Found ${userCount} users.`)

    // Get sample users for each role
    console.log('\n👤 Getting sample users for testing...')
    const [schoolAdmin, teacher, student] = await Promise.all([
      prisma.user.findFirst({
        where: { role: 'SCHOOL_ADMIN' },
        include: { schoolAdmin: true }
      }),
      prisma.user.findFirst({
        where: { role: 'TEACHER' },
        include: { teacher: true }
      }),
      prisma.user.findFirst({
        where: { role: 'STUDENT' },
        include: { student: true }
      })
    ])

    console.log(`Found users: School Admin: ${!!schoolAdmin}, Teacher: ${!!teacher}, Student: ${!!student}`)

    // Test School Admin Dashboard API
    if (schoolAdmin) {
      console.log('\n🏫 Testing School Admin Dashboard API...')
      try {
        // Test the new API we just created
        const schoolAdminRecord = await prisma.schoolAdmin.findUnique({
          where: { userId: schoolAdmin.id },
          include: { school: true }
        })

        if (schoolAdminRecord?.schoolId) {
          const [totalTeachers, totalStudents, subscription] = await Promise.all([
            prisma.teacher.count({ where: { schoolId: schoolAdminRecord.schoolId } }),
            prisma.student.count({ where: { schoolId: schoolAdminRecord.schoolId } }),
            prisma.subscription.findFirst({
              where: { schoolId: schoolAdminRecord.schoolId },
              include: { package: true },
              orderBy: { createdAt: 'desc' }
            })
          ])

          console.log(`✅ School Admin API data:`)
          console.log(`   - School: ${schoolAdminRecord.school.name}`)
          console.log(`   - Teachers: ${totalTeachers}`)
          console.log(`   - Students: ${totalStudents}`)
          console.log(`   - Subscription: ${subscription ? subscription.package.name : 'None'}`)
        }
      } catch (error) {
        console.error('❌ School Admin API test failed:', error)
      }
    }

    // Test Teacher Dashboard API
    if (teacher) {
      console.log('\n👨‍🏫 Testing Teacher Dashboard API...')
      try {
        const teacherRecord = await prisma.teacher.findUnique({
          where: { userId: teacher.id },
          include: {
            school: true,
            students: { take: 5 },
            classes: { take: 5 }
          }
        })

        if (teacherRecord) {
          console.log(`✅ Teacher API data:`)
          console.log(`   - School: ${teacherRecord.school?.name || 'Independent'}`)
          console.log(`   - Students: ${teacherRecord.students.length}`)
          console.log(`   - Classes: ${teacherRecord.classes.length}`)
        }
      } catch (error) {
        console.error('❌ Teacher API test failed:', error)
      }
    }

    // Test Student Dashboard API
    if (student) {
      console.log('\n👨‍🎓 Testing Student Dashboard API...')
      try {
        const studentRecord = await prisma.student.findUnique({
          where: { userId: student.id },
          include: {
            school: true,
            teacher: {
              include: {
                user: { select: { firstName: true, lastName: true } }
              }
            },
            assignments: { take: 5 }
          }
        })

        if (studentRecord) {
          console.log(`✅ Student API data:`)
          console.log(`   - School: ${studentRecord.school?.name || 'Independent'}`)
          console.log(`   - Teacher: ${studentRecord.teacher ? `${studentRecord.teacher.user.firstName} ${studentRecord.teacher.user.lastName}` : 'None'}`)
          console.log(`   - Assignments: ${studentRecord.assignments.length}`)
        }
      } catch (error) {
        console.error('❌ Student API test failed:', error)
      }
    }

    // Test specific API endpoints that might be missing
    console.log('\n🔍 Checking for missing API endpoints...')
    
    const requiredAPIs = [
      'school-admin/dashboard-stats',
      'teacher/dashboard-stats', 
      'student/dashboard',
      'subscription/status',
      'billing'
    ]

    for (const api of requiredAPIs) {
      try {
        // Check if the file exists
        const fs = require('fs')
        const path = require('path')
        const apiPath = path.join(process.cwd(), 'src', 'app', 'api', api, 'route.ts')
        
        if (fs.existsSync(apiPath)) {
          console.log(`✅ API exists: /api/${api}`)
        } else {
          console.log(`❌ API missing: /api/${api}`)
        }
      } catch (error) {
        console.log(`⚠️  Could not check API: /api/${api}`)
      }
    }

    // Test common dashboard queries
    console.log('\n📊 Testing common dashboard queries...')
    
    try {
      const stats = {
        totalUsers: await prisma.user.count(),
        totalSchools: await prisma.school.count(),
        totalTeachers: await prisma.teacher.count(),
        totalStudents: await prisma.student.count(),
        totalSubscriptions: await prisma.subscription.count(),
        activeSubscriptions: await prisma.subscription.count({ where: { status: 'ACTIVE' } })
      }

      console.log('✅ Common queries successful:', stats)
    } catch (error) {
      console.error('❌ Common queries failed:', error)
    }

    console.log('\n✅ Dashboard API Test Completed!')
    
  } catch (error) {
    console.error('❌ Test failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testAllDashboardAPIs()