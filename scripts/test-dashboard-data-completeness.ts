import { prisma } from '@/lib/prisma'

async function testDashboardDataCompleteness() {
  console.log('🧪 Testing Dashboard Data Completeness...')
  
  try {
    // Test the school admin dashboard API directly
    console.log('\n🏫 Testing School Admin Dashboard API Response...')
    
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

    if (!schoolAdmin?.schoolAdmin) {
      console.log('❌ No school admin found')
      return
    }

    const schoolId = schoolAdmin.schoolAdmin.schoolId
    console.log(`Testing with school: ${schoolAdmin.schoolAdmin.school.name} (${schoolId})`)

    // Simulate the API call
    const [
      totalTeachers,
      activeTeachers,
      totalStudents,
      activeStudents,
      totalClasses,
      subscription,
      recentTeachers,
      recentStudents
    ] = await Promise.all([
      prisma.teacher.count({ where: { schoolId } }),
      prisma.teacher.count({ 
        where: { 
          schoolId,
          user: { isActive: true }
        }
      }),
      prisma.student.count({ where: { schoolId } }),
      prisma.student.count({ 
        where: { 
          schoolId,
          user: { isActive: true }
        }
      }),
      prisma.class.count({
        where: {
          teacher: { schoolId }
        }
      }),
      prisma.subscription.findFirst({
        where: { schoolId },
        include: { package: true },
        orderBy: { createdAt: 'desc' }
      }),
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
          },
          students: { take: 5 } // Get student count for each teacher
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
          },
          teacher: {
            include: {
              user: {
                select: {
                  firstName: true,
                  lastName: true
                }
              }
            }
          }
        },
        orderBy: { 
          user: { createdAt: 'desc' }
        },
        take: 5
      })
    ])

    console.log('\n📊 Stats Data:')
    console.log(`  ✅ Total Teachers: ${totalTeachers}`)
    console.log(`  ✅ Active Teachers: ${activeTeachers}`)
    console.log(`  ✅ Total Students: ${totalStudents}`)
    console.log(`  ✅ Active Students: ${activeStudents}`)
    console.log(`  ✅ Total Classes: ${totalClasses}`)
    console.log(`  ✅ Subscription: ${subscription ? subscription.package.name : 'None'}`)

    console.log('\n👥 Recent Teachers Data:')
    recentTeachers.forEach((teacher, index) => {
      console.log(`  ${index + 1}. ${teacher.user.firstName} ${teacher.user.lastName}`)
      console.log(`     - Email: ${teacher.user.email}`)
      console.log(`     - Students: ${teacher.students.length}`)
      console.log(`     - Active: ${teacher.user.isActive}`)
      console.log(`     - Joined: ${teacher.user.createdAt.toLocaleDateString()}`)
    })

    console.log('\n🎓 Recent Students Data:')
    recentStudents.forEach((student, index) => {
      console.log(`  ${index + 1}. ${student.user.firstName} ${student.user.lastName}`)
      console.log(`     - Email: ${student.user.email}`)
      console.log(`     - Teacher: ${student.teacher ? `${student.teacher.user.firstName} ${student.teacher.user.lastName}` : 'None'}`)
      console.log(`     - Active: ${student.user.isActive}`)
      console.log(`     - Joined: ${student.user.createdAt.toLocaleDateString()}`)
    })

    console.log('\n🏢 School Info Data:')
    const school = schoolAdmin.schoolAdmin.school
    console.log(`  ✅ Name: ${school.name}`)
    console.log(`  ✅ Address: ${school.address}`)
    console.log(`  ✅ Phone: ${school.phone}`)
    console.log(`  ✅ Email: ${school.email}`)
    console.log(`  ✅ Active: ${school.isActive}`)
    
    if (subscription) {
      console.log(`  ✅ Subscription Status: ${subscription.status}`)
      console.log(`  ✅ Package: ${subscription.package.name}`)
      console.log(`  ✅ Amount: $${subscription.amount}`)
      console.log(`  ✅ Days Remaining: ${Math.max(0, Math.ceil((subscription.endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))}`)
    }

    // Test the expected API response format
    console.log('\n🔧 Testing API Response Format:')
    const apiResponse = {
      stats: {
        totalTeachers: {
          value: totalTeachers,
          change: `${activeTeachers} active`
        },
        totalStudents: {
          value: totalStudents,
          change: `${activeStudents} active`
        },
        activeClasses: {
          value: totalClasses,
          change: totalClasses > 0 ? `${Math.round(totalStudents / Math.max(totalClasses, 1))} avg students/class` : 'No active classes'
        },
        monthlyRevenue: {
          value: subscription?.amount || 0,
          change: subscription ? subscription.package.name : 'No subscription'
        }
      },
      schoolInfo: {
        id: school.id,
        name: school.name,
        address: school.address,
        phone: school.phone,
        email: school.email,
        isActive: school.isActive,
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
        students: teacher.students.length,
        status: teacher.user.isActive ? 'Active' : 'Inactive',
        joinDate: teacher.user.createdAt.toLocaleDateString(),
        isActive: teacher.user.isActive,
        joinedAt: teacher.user.createdAt
      })),
      recentStudents: recentStudents.map(student => ({
        id: student.id,
        name: `${student.user.firstName} ${student.user.lastName}`,
        email: student.user.email,
        teacher: student.teacher ? `${student.teacher.user.firstName} ${student.teacher.user.lastName}` : 'No teacher',
        status: student.user.isActive ? 'Active' : 'Inactive',
        joinDate: student.user.createdAt.toLocaleDateString(),
        isActive: student.user.isActive,
        joinedAt: student.user.createdAt
      })),
      recentActivities: []
    }

    console.log('✅ API Response Structure Complete:')
    console.log(`  - Stats: ${Object.keys(apiResponse.stats).length} metrics`)
    console.log(`  - School Info: Complete with ${apiResponse.schoolInfo.subscription ? 'subscription' : 'no subscription'}`)
    console.log(`  - Recent Teachers: ${apiResponse.recentTeachers.length} teachers`)
    console.log(`  - Recent Students: ${apiResponse.recentStudents.length} students`)

    // Check for missing data
    console.log('\n🔍 Data Completeness Check:')
    const issues = []
    
    if (totalTeachers === 0) issues.push('No teachers found')
    if (totalStudents === 0) issues.push('No students found')
    if (!subscription) issues.push('No subscription found')
    if (recentTeachers.length === 0) issues.push('No recent teachers')
    if (recentStudents.length === 0) issues.push('No recent students')
    
    if (issues.length > 0) {
      console.log('⚠️  Potential Issues:')
      issues.forEach(issue => console.log(`  - ${issue}`))
    } else {
      console.log('✅ All data complete!')
    }

    console.log('\n✅ Dashboard Data Completeness Test Completed!')
    
  } catch (error) {
    console.error('❌ Test failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testDashboardDataCompleteness()