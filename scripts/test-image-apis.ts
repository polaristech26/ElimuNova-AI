/**
 * Test Image Generation APIs
 * 
 * This script tests your image generation API keys to ensure they work
 */

import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

async function testOpenAI() {
  const apiKey = process.env.OPENAI_DALLE_API_KEY
  
  if (!apiKey || apiKey === 'your-openai-api-key-here') {
    console.log('⏭️  OpenAI DALL-E: Not configured (skipping)')
    return
  }

  console.log('🧪 Testing OpenAI DALL-E...')
  
  try {
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'dall-e-2',
        prompt: 'A simple red circle on white background',
        n: 1,
        size: '256x256'
      })
    })

    if (response.ok) {
      const data = await response.json()
      console.log('✅ OpenAI DALL-E: Working!')
      console.log('   Image URL:', data.data[0].url.substring(0, 50) + '...')
    } else {
      const error = await response.json()
      console.log('❌ OpenAI DALL-E: Failed')
      console.log('   Error:', error.error?.message || 'Unknown error')
    }
  } catch (error) {
    console.log('❌ OpenAI DALL-E: Connection failed')
    console.log('   Error:', error instanceof Error ? error.message : 'Unknown error')
  }
  console.log('')
}

async function testStabilityAI() {
  const apiKey = process.env.STABILITY_API_KEY
  
  if (!apiKey || apiKey === 'your-stability-ai-key-here') {
    console.log('⏭️  Stability AI: Not configured (skipping)')
    return
  }

  console.log('🧪 Testing Stability AI...')
  
  try {
    // Test with account endpoint (doesn't consume credits)
    const response = await fetch('https://api.stability.ai/v1/user/account', {
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    })

    if (response.ok) {
      const data = await response.json()
      console.log('✅ Stability AI: Working!')
      console.log('   Email:', data.email)
      console.log('   Credits:', data.credits || 'N/A')
    } else {
      const error = await response.json()
      console.log('❌ Stability AI: Failed')
      console.log('   Error:', error.message || 'Unknown error')
    }
  } catch (error) {
    console.log('❌ Stability AI: Connection failed')
    console.log('   Error:', error instanceof Error ? error.message : 'Unknown error')
  }
  console.log('')
}

async function testReplicate() {
  const apiKey = process.env.REPLICATE_API_TOKEN
  
  if (!apiKey || apiKey === 'your-replicate-token-here') {
    console.log('⏭️  Replicate: Not configured (skipping)')
    return
  }

  console.log('🧪 Testing Replicate...')
  
  try {
    // Test with account endpoint
    const response = await fetch('https://api.replicate.com/v1/account', {
      headers: {
        'Authorization': `Token ${apiKey}`
      }
    })

    if (response.ok) {
      const data = await response.json()
      console.log('✅ Replicate: Working!')
      console.log('   Username:', data.username || 'N/A')
      console.log('   Type:', data.type || 'N/A')
    } else {
      console.log('❌ Replicate: Failed')
      console.log('   Status:', response.status)
    }
  } catch (error) {
    console.log('❌ Replicate: Connection failed')
    console.log('   Error:', error instanceof Error ? error.message : 'Unknown error')
  }
  console.log('')
}

async function main() {
  console.log('🎨 Testing Image Generation APIs\n')
  console.log('=' .repeat(50))
  console.log('')

  await testOpenAI()
  await testStabilityAI()
  await testReplicate()

  console.log('=' .repeat(50))
  console.log('\n📋 Summary:')
  console.log('')
  console.log('To set up an API:')
  console.log('1. Get an API key from the provider')
  console.log('2. Add it to your .env file')
  console.log('3. Restart your development server')
  console.log('4. Run this test again')
  console.log('')
  console.log('See IMAGE_API_SETUP_GUIDE.md for detailed instructions')
  console.log('')
}

main()
