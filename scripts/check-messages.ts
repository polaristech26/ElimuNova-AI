import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔍 Checking messages in database...\n')

  const messages = await prisma.message.findMany({
    orderBy: { createdAt: 'desc' }
  })

  console.log(`Total messages: ${messages.length}\n`)

  if (messages.length === 0) {
    console.log('❌ No messages found in database!')
    console.log('Run: npx tsx scripts/seed-messages.ts')
    return
  }

  messages.forEach((msg, index) => {
    console.log(`${index + 1}. ${msg.senderType} → ${msg.recipientType}`)
    console.log(`   Subject: ${msg.subject}`)
    console.log(`   Sender ID: ${msg.senderId}`)
    console.log(`   Recipient ID: ${msg.recipientId}`)
    console.log(`   Read: ${msg.isRead}`)
    console.log(`   Created: ${msg.createdAt}`)
    console.log('')
  })

  // Check teacher
  const teacher = await prisma.teacher.findFirst()
  if (teacher) {
    console.log(`\n✅ Teacher ID: ${teacher.id}`)
    
    const teacherMessages = messages.filter(m => 
      m.recipientId === teacher.id || m.senderId === teacher.id
    )
    console.log(`   Messages for this teacher: ${teacherMessages.length}`)
  }

  // Check student
  const student = await prisma.student.findFirst()
  if (student) {
    console.log(`\n✅ Student ID: ${student.id}`)
    console.log(`   Teacher ID: ${student.teacherId}`)
    console.log(`   Teacher ID is null: ${student.teacherId === null}`)
    
    const studentMessages = messages.filter(m => 
      m.recipientId === student.id || m.senderId === student.id
    )
    console.log(`   Messages for this student: ${studentMessages.length}`)
  }

  // Check for broken messages
  console.log('\n🔍 Checking for broken messages...')
  const brokenMessages = messages.filter(m => 
    m.recipientId === 'teacher' || m.recipientId === 'student'
  )
  if (brokenMessages.length > 0) {
    console.log(`❌ Found ${brokenMessages.length} messages with string IDs instead of actual IDs!`)
    brokenMessages.forEach(m => {
      console.log(`   - ${m.subject} (recipientId: "${m.recipientId}")`)
    })
  }
}


main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
