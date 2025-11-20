import { createCheckoutSession } from '@/lib/subscription-service'
import { prisma } from '@/lib/prisma'

async function debugStripeCheckout() {
  console.log('🔍 Debugging Stripe checkout issue...')
  
  try {
    // Get a package to test with
    const premiumPackage = await prisma.package.findFirst({
      where: { name: 'Premium' }
    })

    if (!premiumPackage) {
      console.log('❌ No Premium package found')
      return
    }

    console.log(`✅ Found package: ${premiumPackage.name} - $${premiumPackage.price}`)

    // Get a student to test with
    const student = await prisma.student.findFirst({
      include: { user: true }
    })

    if (!student) {
      console.log('❌ No student found')
      return
    }

    console.log(`✅ Testing with student: ${student.user.email}`)

    // Test checkout session creation with detailed logging
    console.log('\n🔄 Creating checkout session...')
    console.log(`Package ID: ${premiumPackage.id}`)
    console.log(`User ID: ${student.userId}`)
    console.log(`Success URL: http://localhost:3000/subscription/success`)
    console.log(`Cancel URL: http://localhost:3000/subscription/cancel`)

    try {
      const checkoutSession = await createCheckoutSession(
        premiumPackage.id,
        'http://localhost:3000/subscription/success',
        'http://localhost:3000/subscription/cancel',
        student.userId, // Independent student
        undefined // No school
      )

      console.log('✅ Checkout session created successfully!')
      console.log(`Session ID: ${checkoutSession.id}`)
      console.log(`Checkout URL: ${checkoutSession.url}`)
      
      // Check if the URL is valid
      if (checkoutSession.url) {
        console.log('✅ Checkout URL generated')
        
        // Test if the URL is accessible
        try {
          const urlTest = new URL(checkoutSession.url)
          console.log(`✅ URL is valid: ${urlTest.hostname}`)
          
          if (urlTest.hostname === 'checkout.stripe.com') {
            console.log('✅ URL points to Stripe checkout')
          } else {
            console.log(`⚠️  URL points to: ${urlTest.hostname}`)
          }
        } catch (urlError) {
          console.log('❌ Invalid URL format:', urlError.message)
        }
      } else {
        console.log('❌ No checkout URL in response')
      }

    } catch (stripeError) {
      console.log('❌ Stripe checkout session creation failed:')
      console.error(stripeError)
      
      // Check if it's a Stripe API error
      if (stripeError.type) {
        console.log(`Stripe Error Type: ${stripeError.type}`)
        console.log(`Stripe Error Code: ${stripeError.code}`)
        console.log(`Stripe Error Message: ${stripeError.message}`)
      }
      
      // Check if it's an authentication issue
      if (stripeError.message?.includes('Invalid API key') || stripeError.message?.includes('No such')) {
        console.log('🔑 This appears to be a Stripe API key issue')
        console.log('Check your STRIPE_SECRET_KEY in .env file')
      }
      
      // Check if it's a configuration issue
      if (stripeError.message?.includes('price') || stripeError.message?.includes('product')) {
        console.log('💰 This appears to be a pricing configuration issue')
      }
    }

    // Test the API endpoint directly
    console.log('\n🌐 Testing API endpoint...')
    
    const testPayload = {
      packageId: premiumPackage.id,
      successUrl: 'http://localhost:3000/subscription/success',
      cancelUrl: 'http://localhost:3000/subscription/cancel'
    }

    try {
      const response = await fetch('http://localhost:3000/api/subscription/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testPayload)
      })

      console.log(`API Response Status: ${response.status}`)
      
      if (response.status === 401) {
        console.log('✅ API requires authentication (expected)')
      } else if (response.status === 500) {
        const errorData = await response.text()
        console.log('❌ API returned server error:')
        console.log(errorData)
      } else {
        const data = await response.json()
        console.log('API Response:', data)
      }

    } catch (fetchError) {
      console.log('⚠️  Could not reach API endpoint (dev server may not be running)')
    }

    console.log('\n📋 Debug Summary:')
    console.log('- Package data is available')
    console.log('- User data is available')
    console.log('- Checkout function exists')
    console.log('- Check Stripe configuration if errors occurred')

  } catch (error) {
    console.error('❌ Debug test failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

debugStripeCheckout()