import { config } from 'dotenv'
import path from 'path'

// Load environment variables
config({ path: path.resolve(process.cwd(), '.env') })

console.log('🔍 Testing environment variable loading...')
console.log('Current working directory:', process.cwd())
console.log('Environment variables:')
console.log('- STRIPE_SECRET_KEY:', process.env.STRIPE_SECRET_KEY ? 'Set ✅' : 'Not set ❌')
console.log('- NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY:', process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ? 'Set ✅' : 'Not set ❌')
console.log('- DATABASE_URL:', process.env.DATABASE_URL ? 'Set ✅' : 'Not set ❌')

if (process.env.STRIPE_SECRET_KEY) {
  console.log('\n🧪 Testing Stripe with loaded environment...')
  
  try {
    const Stripe = require('stripe')
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-11-20.acacia',
      typescript: true,
    })
    
    console.log('✅ Stripe initialized successfully')
    
    // Test connection
    stripe.accounts.retrieve()
      .then((account: any) => {
        console.log(`✅ Connected to Stripe account: ${account.id}`)
        console.log(`   - Country: ${account.country}`)
        console.log(`   - Currency: ${account.default_currency}`)
      })
      .catch((error: any) => {
        console.error('❌ Stripe connection failed:', error.message)
      })
      
  } catch (error) {
    console.error('❌ Failed to initialize Stripe:', error)
  }
} else {
  console.log('❌ STRIPE_SECRET_KEY not found in environment variables')
}