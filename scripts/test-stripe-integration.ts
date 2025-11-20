import { stripe } from '@/lib/stripe'

async function testStripeIntegration() {
  console.log('🧪 Testing Stripe integration...')
  
  try {
    // Test 1: Check Stripe connection
    console.log('1. Testing Stripe connection...')
    const account = await stripe.accounts.retrieve()
    console.log(`✅ Connected to Stripe account: ${account.id}`)
    console.log(`   - Country: ${account.country}`)
    console.log(`   - Currency: ${account.default_currency}`)

    // Test 2: Create a test customer
    console.log('\n2. Creating test customer...')
    const customer = await stripe.customers.create({
      email: 'test@edugenius.ai',
      name: 'Test User',
      metadata: {
        userId: 'test-user-id',
        type: 'independent'
      }
    })
    console.log(`✅ Created customer: ${customer.id}`)

    // Test 3: Create a test product and price
    console.log('\n3. Creating test product and price...')
    const product = await stripe.products.create({
      name: 'EduGenius AI Basic Plan',
      description: 'Basic subscription for EduGenius AI'
    })
    console.log(`✅ Created product: ${product.id}`)

    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: 2999, // $29.99
      currency: 'usd',
      recurring: {
        interval: 'month'
      }
    })
    console.log(`✅ Created price: ${price.id} ($${price.unit_amount / 100})`)

    // Test 4: Create a checkout session
    console.log('\n4. Creating checkout session...')
    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      payment_method_types: ['card'],
      line_items: [
        {
          price: price.id,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: 'http://localhost:3000/subscription/success?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: 'http://localhost:3000/subscription/cancel',
      metadata: {
        userId: 'test-user-id',
        packageId: 'test-package-id'
      }
    })
    console.log(`✅ Created checkout session: ${session.id}`)
    console.log(`   - URL: ${session.url}`)

    // Cleanup test data
    console.log('\n5. Cleaning up test data...')
    await stripe.customers.del(customer.id)
    await stripe.products.del(product.id)
    console.log('✅ Cleanup completed')

    console.log('\n🎉 Stripe integration test completed successfully!')
    console.log('\n📋 Next steps:')
    console.log('1. Set up webhook endpoint in Stripe dashboard')
    console.log('2. Configure webhook secret in environment variables')
    console.log('3. Test payment flows in the application')

  } catch (error) {
    console.error('❌ Stripe integration test failed:', error)
    
    if (error instanceof Error) {
      if (error.message.includes('Invalid API Key')) {
        console.error('🔑 Please check your STRIPE_SECRET_KEY in .env file')
      } else if (error.message.includes('No such')) {
        console.error('🏪 Please ensure your Stripe account is properly set up')
      }
    }
    
    throw error
  }
}

testStripeIntegration()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })