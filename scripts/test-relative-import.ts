import { getSubscriptionStatus } from '../src/lib/subscription-service.js'

console.log('Testing relative import...')
console.log('getSubscriptionStatus:', typeof getSubscriptionStatus)

getSubscriptionStatus('test').then(result => {
  console.log('Result:', result)
}).catch(err => {
  console.log('Error:', err.message)
})