import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function resetPassword() {
  try {
    const email = 'angel@gmail.com'
    const newPassword = 'Student@123'

    console.log(`🔐 Resetting password for ${email}...\n`)

    // Find the user
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        student: true
      }
    })

    if (!user) {
      console.log('❌ User not found')
      return
    }

    console.log('✅ User found:')
    console.log(`   Name: ${user.firstName} ${user.lastName}`)
    console.log(`   Email: ${user.email}`)
    console.log(`   Role: ${user.role}`)
    console.log(`   Active: ${user.isActive}`)
    console.log(`   Has Student Record: ${!!user.student}\n`)

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    // Update the password and ensure user is active
    await prisma.user.update({
      where: { email },
      data: {
        password: hashedPassword,
        isActive: true
      }
    })

    console.log('✅ Password reset successfully!')
    console.log(`   New password: ${newPassword}`)
    console.log(`   User is now active: true\n`)

    // Test the password
    const updatedUser = await prisma.user.findUnique({
      where: { email }
    })

    if (updatedUser) {
      const isValid = await bcrypt.compare(newPassword, updatedUser.password)
      console.log(`🔍 Password verification: ${isValid ? '✅ VALID' : '❌ INVALID'}`)
    }

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

resetPassword()
