import { prisma } from '@/lib/prisma'

async function checkSubscriptionStatuses() {
  try {
    const subscriptions = await prisma.subscription.findMany({
      select: { status: true }
    })
    
    const statuses = [...new Set(subscriptions.map(s => s.status))]
    console.log('Available subscription statuses:', statuses)
    
    // Check each status count
    for (const status of statuses) {
      const count = await prisma.subscription.count({ where: { status } })
      console.log(`${status}: ${count}`)
    }
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkSubscriptionStatuses()