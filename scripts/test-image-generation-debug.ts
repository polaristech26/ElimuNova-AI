#!/usr/bin/env tsx

/**
 * Debug script to test image generation API
 * This script will help identify why images are not being generated
 */

import { config } from 'dotenv'

// Load environment variables
config()

console.log('🔍 Testing Image Generation API...\n')

// Test 1: Check environment variables
console.log('1. Checking environment variables...')
const stabilityKey = process.env.STABILITY_API_KEY
const openaiKey = process.env.OPENAI_DALLE_API_KEY

if (stabilityKey) {
  console.log('✅ STABILITY_API_KEY is set:', stabilityKey.substring(0, 10) + '...')
} else {
  console.log('❌ STABILITY_API_KEY is not set')
}

if (openaiKey) {
  console.log('✅ OPENAI_DALLE_API_KEY is set:', openaiKey.substring(0, 10) + '...')
} else {
  console.log('❌ OPENAI_DALLE_API_KEY is not set')
}

// Test 2: Test Stability AI API directly
console.log('\n2. Testing Stability AI API directly...')
async function testStabilityAI() {
  try {
    const response = await fetch('https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${stabilityKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text_prompts: [
          {
            text: 'A simple educational diagram showing the water cycle, bright colors, child-friendly, high quality',
            weight: 1
          }
        ],
        cfg_scale: 7,
        height: 1024,
        width: 1024,
        samples: 1,
        steps: 20,
      }),
    })

    console.log('Stability AI Response Status:', response.status)
    
    if (response.ok) {
      const data = await response.json()
      if (data.artifacts && data.artifacts[0]) {
        console.log('✅ Stability AI API working - Image generated successfully')
        console.log('Image size:', data.artifacts[0].base64.length, 'characters')
        return true
      } else {
        console.log('❌ Stability AI API returned no image data')
        console.log('Response:', JSON.stringify(data, null, 2))
        return false
      }
    } else {
      const errorText = await response.text()
      console.log('❌ Stability AI API error:', response.status, errorText)
      return false
    }
  } catch (error) {
    console.log('❌ Stability AI API connection error:', error)
    return false
  }
}

// Test 3: Test OpenAI DALL-E API as fallback
console.log('\n3. Testing OpenAI DALL-E API as fallback...')
async function testOpenAI() {
  try {
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: 'A simple educational diagram showing the water cycle, bright colors, child-friendly',
        n: 1,
        size: '1024x1024',
        response_format: 'url'
      }),
    })

    console.log('OpenAI DALL-E Response Status:', response.status)
    
    if (response.ok) {
      const data = await response.json()
      if (data.data && data.data[0] && data.data[0].url) {
        console.log('✅ OpenAI DALL-E API working - Image generated successfully')
        console.log('Image URL:', data.data[0].url)
        return true
      } else {
        console.log('❌ OpenAI DALL-E API returned no image data')
        console.log('Response:', JSON.stringify(data, null, 2))
        return false
      }
    } else {
      const errorText = await response.text()
      console.log('❌ OpenAI DALL-E API error:', response.status, errorText)
      return false
    }
  } catch (error) {
    console.log('❌ OpenAI DALL-E API connection error:', error)
    return false
  }
}

// Test 4: Test local API endpoint
console.log('\n4. Testing local image generation API endpoint...')
async function testLocalAPI() {
  try {
    const response = await fetch('http://localhost:3000/api/ai/generate-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': 'next-auth.session-token=test' // Mock session for testing
      },
      body: JSON.stringify({
        prompt: 'A simple educational diagram showing the water cycle',
        style: 'educational'
      })
    })

    console.log('Local API Response Status:', response.status)
    
    if (response.ok) {
      const data = await response.json()
      if (data.imageUrl) {
        console.log('✅ Local image generation API working')
        console.log('Image URL length:', data.imageUrl.length)
        return true
      } else {
        console.log('❌ Local API returned no image URL')
        console.log('Response:', JSON.stringify(data, null, 2))
        return false
      }
    } else {
      const errorText = await response.text()
      console.log('❌ Local API error:', response.status, errorText)
      return false
    }
  } catch (error) {
    console.log('❌ Local API connection error:', error)
    return false
  }
}

// Run all tests
async function runTests() {
  const stabilityWorking = await testStabilityAI()
  const openaiWorking = await testOpenAI()
  
  console.log('\n📊 Test Results Summary:')
  console.log('- Stability AI API:', stabilityWorking ? '✅ Working' : '❌ Not Working')
  console.log('- OpenAI DALL-E API:', openaiWorking ? '✅ Working' : '❌ Not Working')
  
  if (!stabilityWorking && !openaiWorking) {
    console.log('\n🚨 ISSUE FOUND: Both image generation APIs are not working')
    console.log('Possible causes:')
    console.log('1. Invalid API keys')
    console.log('2. Network connectivity issues')
    console.log('3. API rate limits exceeded')
    console.log('4. API service outages')
  } else if (!stabilityWorking) {
    console.log('\n⚠️  Stability AI not working, but OpenAI DALL-E is available as fallback')
  } else if (!openaiWorking) {
    console.log('\n⚠️  OpenAI DALL-E not working, but Stability AI is available')
  } else {
    console.log('\n✅ Both image generation APIs are working properly')
  }
  
  console.log('\n🔧 Recommendations:')
  if (!stabilityWorking && !openaiWorking) {
    console.log('1. Check API keys in .env file')
    console.log('2. Verify network connectivity')
    console.log('3. Check API service status')
    console.log('4. Consider implementing a fallback image system')
  } else {
    console.log('1. Update image generation API to use working service')
    console.log('2. Add proper error handling and fallbacks')
    console.log('3. Test the PowerPoint generation with images')
  }
}

runTests().catch(console.error)