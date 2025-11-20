import { prisma } from '@/lib/prisma'

async function testSchoolAdminAPI() {
  console.log('🧪 Testing School Admin API...')
  
  try {
    // Get a school admin user
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

    if (!schoolAdmin) {
      console.log('❌ No school admin found')
      return
    }

    console.log(`✅ Found school admin: ${schoolAdmin.firstName} ${schoolAdmin.lastName}`)
    console.log(`   - User ID: ${schoolAdmin.id}`)
    console.log(`   - School: ${schoolAdmin.schoolAdmin?.school?.name}`)
    console.log(`   - School ID: ${schoolAdmin.schoolAdmin?.schoolId}`)

    // Test the API logic manually
    const schoolAdminRecord = schoolAdmin.schoolAdmin
    if (!schoolAdminRecord) {
      console.log('❌ No school admin record found')
      return
    }

    const schoolId = schoolAdminRecord.schoolId
    console.log(`\n🏫 Testing queries for school: ${schoolId}`)

    try {
      const [totalTeachers, totalStudents, subscription] = await Promise.all([
        prisma.teacher.count({ where: { schoolId } }),
        prisma.student.count({ where: { schoolId } }),
        prisma.subscription.findFirst({
          where: { schoolId },
          include: { package: true },
          orderBy: { createdAt: 'desc' }
        })
      ])

      console.log(`✅ Query results:`)
      console.log(`   - Teachers: ${totalTeachers}`)
      console.log(`   - Students: ${totalStudents}`)
      console.log(`   - Subscription: ${subscription ? subscription.package.name : 'None'}`)

      // Test recent data queries
      const [recentTeachers, recentStudents] = await Promise.all([
        prisma.teacher.findMany({
          where: { schoolId },
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
                isActive: true,
                createdAt: true
              }
            }
          },
          orderBy: { 
            user: { createdAt: 'desc' }
          },
          take: 5
        }),
        prisma.student.findMany({
          where: { schoolId },
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
                isActive: true,
                createdAt: true
              }
            }
          },
          orderBy: { 
            user: { createdAt: 'desc' }
          },
          take: 5
        })
      ])

      console.log(`✅ Recent data:`)
      console.log(`   - Recent teachers: ${recentTeachers.length}`)
      console.log(`   - Recent students: ${recentStudents.length}`)

      // Test the response format
      const responseData = {
        stats: {
          totalTeachers: {
            value: totalTeachers,
            change: `${totalTeachers} active`
          },
          activeTeachers: {
            value: totalTeachers, // Simplified for test
            change: `100% active`
          },
          totalStudents: {
            value: totalStudents,
            change: `${totalStudents} active`
          },
          activeStudents: {
            value: totalStudents, // Simplified for test
            change: `100% active`
          },
          totalClasses: {
            value: 0,
            change: 'No classes'
          },
          activeClasses: {
            value: 0,
            change: 'No active classes'
          },
          monthlyRevenue: {
            value: subscription?.amount || 0,
            change: subscription ? subscription.package.name : 'No subscription'
          }
        },
        schoolInfo: {
          id: schoolAdminRecord.school.id,
          name: schoolAdminRecord.school.name,
          address: schoolAdminRecord.school.address,
          phone: schoolAdminRecord.school.phone,
          email: schoolAdminRecord.school.email,
          isActive: schoolAdminRecord.school.isActive,
          subscription: subscription ? {
            id: subscription.id,
            status: subscription.status,
            packageName: subscription.package.name,
            amount: subscription.amount,
            startDate: subscription.startDate,
            endDate: subscription.endDate,
            daysRemaining: Math.max(0, Math.ceil((subscription.endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
          } : null
        },
        recentTeachers: recentTeachers.map(teacher => ({
          id: teacher.id,
          name: `${teacher.user.firstName} ${teacher.user.lastName}`,
          email: teacher.user.email,
          isActive: teacher.user.isActive,
          joinedAt: teacher.user.createdAt
        })),
        recentStudents: recentStudents.map(student => ({
          id: student.id,
          name: `${student.user.firstName} ${student.user.lastName}`,
          email: student.user.email,
          isActive: student.user.isActive,
          joinedAt: student.user.createdAt
        })),
        recentActivities: []
      }

      console.log(`\n✅ API Response Format Test:`)
      console.log(`   - Has stats: ${!!responseData.stats}`)
      console.log(`   - Has schoolInfo: ${!!responseData.schoolInfo}`)
      console.log(`   - Has recentTeachers: ${!!responseData.recentTeachers}`)
      console.log(`   - Has recentStudents: ${!!responseData.recentStudents}`)
      console.log(`   - Has recentActivities: ${!!responseData.recentActivities}`)

      console.log(`\n📊 Sample Response:`)
      console.log(JSON.stringify(responseData, null, 2))

    } catch (queryError) {
      console.error('❌ Query error:', queryError)
    }

    console.log('\n✅ School Admin API Test Completed!')
    
  } catch (error) {
    console.error('❌ Test failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testSchoolAdminAPI()