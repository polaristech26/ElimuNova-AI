import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function resetAllStudentPasswords() {
  try {
    const newPassword = 'Student@123'

    console.log('🔐 Resetting passwords for all students...\n')

    // Get all students
    const students = await prisma.student.findMany({
      include: {
        user: true
      }
    })

    console.log(`Found ${students.length} students\n`)

    // Hash the new password once
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    // Update each student
    for (const student of students) {
      console.log(`Processing: ${student.user.firstName} ${student.user.lastName}`)
      console.log(`   Email: ${student.user.email}`)
      console.log(`   Current Active Status: ${student.user.isActive}`)

      await prisma.user.update({
        where: { id: student.userId },
        data: {
          password: hashedPassword,
          isActive: true
        }
      })

      console.log(`   ✅ Password reset and activated\n`)
    }

    console.log('✅ All student passwords have been reset!')
    console.log(`   Password: ${newPassword}`)
    console.log(`   All students are now active\n`)

    // Verify
    console.log('🔍 Verification:\n')
    for (const student of students) {
      const user = await prisma.user.findUnique({
        where: { id: student.userId }
      })

      if (user) {
        const isValid = await bcrypt.compare(newPassword, user.password)
        console.log(`   ${user.email}: ${isValid ? '✅' : '❌'} (Active: ${user.isActive})`)
      }
    }

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

resetAllStudentPasswords()
