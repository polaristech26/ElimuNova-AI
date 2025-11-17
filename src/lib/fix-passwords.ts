import { prisma } from './prisma'
import bcrypt from 'bcryptjs'

export async function fixPlainTextPasswords() {
  try {
    console.log('Starting password fix process...')
    
    // Find users with plain text passwords (passwords that don't start with $2a$ or $2b$)
    const usersWithPlainTextPasswords = await prisma.user.findMany({
      where: {
        password: {
          not: {
            startsWith: '$2a$'
          }
        }
      }
    })

    console.log(`Found ${usersWithPlainTextPasswords.length} users with plain text passwords`)

    for (const user of usersWithPlainTextPasswords) {
      try {
        // Check if password is already hashed by trying to compare with itself
        const isAlreadyHashed = user.password.startsWith('$2a$') || user.password.startsWith('$2b$')
        
        if (!isAlreadyHashed) {
          // Hash the plain text password
          const hashedPassword = await bcrypt.hash(user.password, 12)
          
          // Update the user with the hashed password
          await prisma.user.update({
            where: { id: user.id },
            data: { password: hashedPassword }
          })
          
          console.log(`Fixed password for user: ${user.email}`)
        }
      } catch (error) {
        console.error(`Error fixing password for user ${user.email}:`, error)
      }
    }

    console.log('Password fix process completed!')
  } catch (error) {
    console.error('Error in password fix process:', error)
  }
}
