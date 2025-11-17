import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function seedNotifications() {
  try {
    console.log('🌱 Seeding notifications...')

    // Get all users
    const users = await prisma.user.findMany({
      select: { id: true, role: true, firstName: true, lastName: true }
    })

    if (users.length === 0) {
      console.log('No users found. Please run the main seed script first.')
      return
    }

    // Create sample notifications for each user
    for (const user of users) {
      const notifications = [
        {
          title: 'Welcome to ElimuNova AI!',
          message: `Welcome ${user.firstName}! Your account has been successfully created.`,
          type: 'success',
          userId: user.id
        },
        {
          title: 'System Update',
          message: 'A new feature has been added to your dashboard. Check it out!',
          type: 'info',
          userId: user.id
        }
      ]

      // Add role-specific notifications
      if (user.role === 'SUPER_ADMIN') {
        notifications.push({
          title: 'New School Registration',
          message: 'A new school has requested access to the platform.',
          type: 'warning',
          userId: user.id
        })
      } else if (user.role === 'SCHOOL_ADMIN') {
        notifications.push({
          title: 'New Teacher Enrolled',
          message: 'A new teacher has been enrolled in your school.',
          type: 'info',
          userId: user.id
        })
      } else if (user.role === 'TEACHER') {
        notifications.push({
          title: 'Assignment Submitted',
          message: 'A student has submitted their assignment for review.',
          type: 'info',
          userId: user.id
        })
      } else if (user.role === 'STUDENT') {
        notifications.push({
          title: 'New Assignment Available',
          message: 'Your teacher has posted a new assignment.',
          type: 'info',
          userId: user.id
        })
      }

      // Create notifications
      for (const notification of notifications) {
        await prisma.notification.create({
          data: notification
        })
      }
    }

    console.log('✅ Notifications seeded successfully!')
  } catch (error) {
    console.error('❌ Error seeding notifications:', error)
  } finally {
    await prisma.$disconnect()
  }
}

seedNotifications()
