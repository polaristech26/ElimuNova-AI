import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testDatabase() {
  try {
    console.log('🔍 Testing database connection...\n')

    // Test connection
    await prisma.$connect()
    console.log('✅ Database connected successfully!\n')

    // Count all users
    const userCount = await prisma.user.count()
    console.log(`👥 Total users: ${userCount}`)

    // Count by role
    const studentCount = await prisma.user.count({ where: { role: 'STUDENT' } })
    const teacherCount = await prisma.user.count({ where: { role: 'TEACHER' } })
    const adminCount = await prisma.user.count({ where: { role: 'SCHOOL_ADMIN' } })
    
    console.log(`   - Students: ${studentCount}`)
    console.log(`   - Teachers: ${teacherCount}`)
    console.log(`   - Admins: ${adminCount}\n`)

    // Get all students with details
    const students = await prisma.student.findMany({
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            isActive: true
          }
        },
        school: {
          select: {
            name: true
          }
        },
        class: {
          select: {
            name: true
          }
        }
      }
    })

    console.log('📚 Student Records:\n')
    if (students.length === 0) {
      console.log('   ⚠️  No students found in database')
    } else {
      students.forEach((student, index) => {
        console.log(`   ${index + 1}. ${student.user.firstName} ${student.user.lastName}`)
        console.log(`      Email: ${student.user.email}`)
        console.log(`      Active: ${student.user.isActive}`)
        console.log(`      School: ${student.school.name}`)
        console.log(`      Class: ${student.class?.name || 'Not assigned'}`)
        console.log(`      Student ID: ${student.id}`)
        console.log(`      User ID: ${student.userId}`)
        console.log(`      School ID: ${student.schoolId}`)
        console.log('')
      })
    }

    // Get all schools
    const schools = await prisma.school.findMany({
      select: {
        id: true,
        name: true,
        _count: {
          select: {
            students: true,
            teachers: true
          }
        }
      }
    })

    console.log('🏫 Schools:\n')
    schools.forEach((school, index) => {
      console.log(`   ${index + 1}. ${school.name}`)
      console.log(`      ID: ${school.id}`)
      console.log(`      Students: ${school._count.students}`)
      console.log(`      Teachers: ${school._count.teachers}`)
      console.log('')
    })

  } catch (error) {
    console.error('❌ Database error:', error)
  } finally {
    await prisma.$disconnect()
    console.log('👋 Database disconnected')
  }
}

testDatabase()
