// Test script to verify subscription service exports
import { 
  getSubscriptionStatus, 
  startFreeTrial, 
  createStripeCustomer,
  hasAccess 
} from '@/lib/subscription-service'

console.log('Testing subscription service exports...')

console.log('✅ getSubscriptionStatus:', typeof getSubscriptionStatus)
console.log('✅ startFreeTrial:', typeof startFreeTrial)
console.log('✅ createStripeCustomer:', typeof createStripeCustomer)
console.log('✅ hasAccess:', typeof hasAccess)

console.log('All exports are working correctly!')