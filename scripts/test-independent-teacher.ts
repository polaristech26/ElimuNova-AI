import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testIndependentTeacher() {
  console.log('🧪 Testing independent teacher functionality...')
  
  try {
    // Find an independent teacher (one with null schoolId)
    const independentTeacher = await prisma.teacher.findFirst({
      where: {
        schoolId: null
      },
      include: {
        user: true,
        classes: true,
        students: true
      }
    })

    if (!independentTeacher) {
      console.log('❌ No independent teacher found. Creating one for testing...')
      
      // Create a test independent teacher
      const testUser = await prisma.user.create({
        data: {
          email: 'independent.teacher@test.com',
          password: 'hashedpassword',
          firstName: 'Independent',
          lastName: 'Teacher',
          role: 'TEACHER',
          isActive: true
        }
      })

      const testTeacher = await prisma.teacher.create({
        data: {
          userId: testUser.id,
          schoolId: null // Independent teacher
        }
      })

      console.log('✅ Created test independent teacher:', testUser.email)
      return testTeacher
    }

    console.log('✅ Found independent teacher:', independentTeacher.user.email)
    console.log('📊 Teacher stats:')
    console.log(`   - Classes: ${independentTeacher.classes.length}`)
    console.log(`   - Students: ${independentTeacher.students.length}`)
    console.log(`   - School ID: ${independentTeacher.schoolId || 'null (independent)'}`)

    // Test class creation capability
    console.log('\n🏫 Testing class creation for independent teacher...')
    
    const testClass = await prisma.class.create({
      data: {
        name: 'Test Independent Class',
        subject: 'Mathematics',
        grade: 'Grade 8',
        description: 'Test class for independent teacher',
        schoolId: independentTeacher.schoolId, // This should be null
        teacherId: independentTeacher.id,
        isActive: true
      }
    })

    console.log('✅ Successfully created class for independent teacher:', testClass.name)

    // Test student enrollment
    console.log('\n👥 Testing student enrollment for independent teacher...')
    
    const testStudentUser = await prisma.user.create({
      data: {
        email: 'independent.student@test.com',
        password: 'hashedpassword',
        firstName: 'Independent',
        lastName: 'Student',
        role: 'STUDENT',
        isActive: true
      }
    })

    const testStudent = await prisma.student.create({
      data: {
        userId: testStudentUser.id,
        schoolId: independentTeacher.schoolId, // This should be null
        teacherId: independentTeacher.id,
        classId: testClass.id
      }
    })

    console.log('✅ Successfully enrolled student for independent teacher:', testStudentUser.email)

    // Clean up test data
    console.log('\n🧹 Cleaning up test data...')
    await prisma.student.delete({ where: { id: testStudent.id } })
    await prisma.user.delete({ where: { id: testStudentUser.id } })
    await prisma.class.delete({ where: { id: testClass.id } })
    
    console.log('✅ Test data cleaned up')
    console.log('\n🎉 All tests passed! Independent teachers can create classes and enroll students.')

  } catch (error) {
    console.error('❌ Test failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

testIndependentTeacher()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })