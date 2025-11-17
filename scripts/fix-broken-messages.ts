import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔧 Fixing broken messages...\n')

  // Find messages with string IDs
  const brokenMessages = await prisma.message.findMany({
    where: {
      OR: [
        { recipientId: 'teacher' },
        { recipientId: 'student' }
      ]
    }
  })

  console.log(`Found ${brokenMessages.length} broken messages\n`)

  for (const message of brokenMessages) {
    console.log(`Fixing message: ${message.subject}`)
    console.log(`  Sender: ${message.senderType} (${message.senderId})`)
    console.log(`  Recipient: ${message.recipientType} (${message.recipientId})`)

    if (message.recipientId === 'teacher' && message.senderType === 'STUDENT') {
      // Get the student's teacher
      const student = await prisma.student.findUnique({
        where: { id: message.senderId }
      })

      if (student?.teacherId) {
        await prisma.message.update({
          where: { id: message.id },
          data: { recipientId: student.teacherId }
        })
        console.log(`  ✅ Fixed! New recipientId: ${student.teacherId}\n`)
      } else {
        console.log(`  ❌ Cannot fix - student has no teacher assigned\n`)
      }
    }
  }

  console.log('✅ Done!')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
