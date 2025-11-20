import { prisma } from '@/lib/prisma'

async function testSchoolAdminAPIDirect() {
  console.log('🧪 Testing School Admin API Direct Call...')
  
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

    if (!schoolAdmin?.schoolAdmin) {
      console.log('❌ No school admin found')
      return
    }

    const schoolId = schoolAdmin.schoolAdmin.schoolId
    console.log(`Testing API logic for school: ${schoolId}`)

    // Test each query individually to find the issue
    console.log('\n🔍 Testing individual queries...')

    try {
      console.log('1. Testing teacher counts...')
      const [totalTeachers, activeTeachers] = await Promise.all([
        prisma.teacher.count({ where: { schoolId } }),
        prisma.teacher.count({ 
          where: { 
            schoolId,
            user: { isActive: true }
          }
        })
      ])
      console.log(`✅ Teachers: ${totalTeachers} total, ${activeTeachers} active`)
    } catch (error) {
      console.error('❌ Teacher count failed:', error)
    }

    try {
      console.log('2. Testing student counts...')
      const [totalStudents, activeStudents] = await Promise.all([
        prisma.student.count({ where: { schoolId } }),
        prisma.student.count({ 
          where: { 
            schoolId,
            user: { isActive: true }
          }
        })
      ])
      console.log(`✅ Students: ${totalStudents} total, ${activeStudents} active`)
    } catch (error) {
      console.error('❌ Student count failed:', error)
    }

    try {
      console.log('3. Testing class count...')
      const totalClasses = await prisma.class.count({
        where: {
          teacher: { schoolId }
        }
      })
      console.log(`✅ Classes: ${totalClasses}`)
    } catch (error) {
      console.error('❌ Class count failed:', error)
    }

    try {
      console.log('4. Testing subscription...')
      const subscription = await prisma.subscription.findFirst({
        where: { schoolId },
        include: { package: true },
        orderBy: { createdAt: 'desc' }
      })
      console.log(`✅ Subscription: ${subscription ? subscription.package.name : 'None'}`)
    } catch (error) {
      console.error('❌ Subscription query failed:', error)
    }

    try {
      console.log('5. Testing recent teachers...')
      const recentTeachers = await prisma.teacher.findMany({
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
          students: {
            select: { id: true }
          }
        },
        orderBy: { 
          user: { createdAt: 'desc' }
        },
        take: 5
      })
      console.log(`✅ Recent teachers: ${recentTeachers.length}`)
    } catch (error) {
      console.error('❌ Recent teachers query failed:', error)
    }

    try {
      console.log('6. Testing recent students...')
      const recentStudents = await prisma.student.findMany({
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
      console.log(`✅ Recent students: ${recentStudents.length}`)
    } catch (error) {
      console.error('❌ Recent students query failed:', error)
    }

    // Test the complete API logic
    console.log('\n🔧 Testing complete API logic...')
    try {
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
            students: {
              select: { id: true }
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

      console.log('✅ All queries successful!')
      console.log('📊 Results:')
      console.log(`  - Teachers: ${totalTeachers} (${activeTeachers} active)`)
      console.log(`  - Students: ${totalStudents} (${activeStudents} active)`)
      console.log(`  - Classes: ${totalClasses}`)
      console.log(`  - Subscription: ${subscription ? subscription.package.name : 'None'}`)
      console.log(`  - Recent teachers: ${recentTeachers.length}`)
      console.log(`  - Recent students: ${recentStudents.length}`)

    } catch (error) {
      console.error('❌ Complete API logic failed:', error)
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      })
    }

    console.log('\n✅ School Admin API Direct Test Completed!')
    
  } catch (error) {
    console.error('❌ Test failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testSchoolAdminAPIDirect()