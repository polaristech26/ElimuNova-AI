// Test direct import of createCheckoutSession
console.log('🧪 Testing direct import of createCheckoutSession...')

try {
  const subscriptionService = require('../src/lib/subscription-service')
  console.log('Available exports:', Object.keys(subscriptionService))
  
  if (subscriptionService.createCheckoutSession) {
    console.log('✅ createCheckoutSession is available')
    console.log('Function type:', typeof subscriptionService.createCheckoutSession)
  } else {
    console.log('❌ createCheckoutSession is NOT available')
  }

  if (subscriptionService.createStripeCustomer) {
    console.log('✅ createStripeCustomer is available')
  } else {
    console.log('❌ createStripeCustomer is NOT available')
  }

} catch (error) {
  console.error('❌ Import failed:', error.message)
}

// Test ES6 import
async function testES6Import() {
  try {
    const { createCheckoutSession, createStripeCustomer } = await import('../src/lib/subscription-service')
    console.log('\n✅ ES6 import successful')
    console.log('createCheckoutSession type:', typeof createCheckoutSession)
    console.log('createStripeCustomer type:', typeof createStripeCustomer)
  } catch (error) {
    console.error('❌ ES6 import failed:', error.message)
  }
}

testES6Import()