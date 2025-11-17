import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding messages...')

  // Get the demo teacher and student
  const teacher = await prisma.teacher.findFirst({
    include: { user: true }
  })

  const student = await prisma.student.findFirst({
    include: { user: true }
  })

  if (!teacher || !student) {
    console.log('❌ No teacher or student found. Please run the main seed first.')
    return
  }

  console.log(`✅ Found teacher: ${teacher.user.firstName} ${teacher.user.lastName}`)
  console.log(`✅ Found student: ${student.user.firstName} ${student.user.lastName}`)

  // Create welcome message from teacher to student
  const welcomeMessage = await prisma.message.create({
    data: {
      senderId: teacher.id,
      senderType: 'TEACHER',
      recipientId: student.id,
      recipientType: 'STUDENT',
      subject: 'Welcome to the Class!',
      content: `Hello ${student.user.firstName},

Welcome to our class! I'm excited to have you here. This messaging system allows us to communicate directly about your assignments, progress, and any questions you might have.

Feel free to reach out anytime you need help or clarification on any topic.

Best regards,
${teacher.user.firstName} ${teacher.user.lastName}`,
      isRead: false,
      attachments: []
    }
  })

  console.log('✅ Created welcome message')

  // Create assignment reminder from teacher
  const assignmentMessage = await prisma.message.create({
    data: {
      senderId: teacher.id,
      senderType: 'TEACHER',
      recipientId: student.id,
      recipientType: 'STUDENT',
      subject: 'Assignment Reminder: Math Homework Due Soon',
      content: `Hi ${student.user.firstName},

This is a friendly reminder that your Math homework is due in 2 days. Please make sure to complete all the problems and show your work.

If you're having trouble with any questions, don't hesitate to ask for help!

Good luck!
${teacher.user.firstName}`,
      isRead: false,
      attachments: []
    }
  })

  console.log('✅ Created assignment reminder')

  // Create progress update from teacher
  const progressMessage = await prisma.message.create({
    data: {
      senderId: teacher.id,
      senderType: 'TEACHER',
      recipientId: student.id,
      recipientType: 'STUDENT',
      subject: 'Great Progress This Week!',
      content: `Dear ${student.user.firstName},

I wanted to take a moment to acknowledge your excellent work this week. Your participation in class discussions has been outstanding, and your recent test scores show significant improvement.

Keep up the great work! I'm proud of your dedication to learning.

Best,
${teacher.user.firstName} ${teacher.user.lastName}`,
      isRead: true,
      readAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // Read 2 days ago
    }
  })

  console.log('✅ Created progress update')

  // Create a question from student to teacher
  const questionMessage = await prisma.message.create({
    data: {
      senderId: student.id,
      senderType: 'STUDENT',
      recipientId: teacher.id,
      recipientType: 'TEACHER',
      subject: 'Question About Science Project',
      content: `Hi ${teacher.user.firstName},

I have a question about the science project. For the experiment section, should we include the hypothesis before or after the materials list?

Also, is there a specific format you'd like us to use for the bibliography?

Thank you!
${student.user.firstName}`,
      isRead: false,
      attachments: []
    }
  })

  console.log('✅ Created student question')

  // Create reply from teacher
  const replyMessage = await prisma.message.create({
    data: {
      senderId: teacher.id,
      senderType: 'TEACHER',
      recipientId: student.id,
      recipientType: 'STUDENT',
      subject: 'Re: Question About Science Project',
      content: `Hi ${student.user.firstName},

Great questions! Here are the answers:

1. The hypothesis should come BEFORE the materials list. The order should be:
   - Title
   - Hypothesis
   - Materials
   - Procedure
   - Results
   - Conclusion

2. For the bibliography, please use MLA format. I'll share a guide with examples in class tomorrow.

Let me know if you have any other questions!

${teacher.user.firstName}`,
      isRead: false,
      parentId: questionMessage.id,
      attachments: []
    }
  })

  console.log('✅ Created teacher reply')

  console.log('\n📊 Summary:')
  console.log(`   - Created 5 messages`)
  console.log(`   - 3 from teacher to student`)
  console.log(`   - 1 from student to teacher`)
  console.log(`   - 1 reply in thread`)
  console.log('\n✅ Message seeding complete!')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding messages:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
