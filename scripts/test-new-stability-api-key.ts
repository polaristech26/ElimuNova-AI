#!/usr/bin/env tsx

/**
 * Test the new Stability AI API key
 */

import { config } from 'dotenv'

// Load environment variables
config()

console.log('🔑 Testing New Stability AI API Key...\n')

async function testStabilityAI() {
  const stabilityKey = process.env.STABILITY_API_KEY
  
  if (!stabilityKey) {
    console.log('❌ STABILITY_API_KEY not found in environment')
    return false
  }
  
  console.log('✅ STABILITY_API_KEY loaded:', stabilityKey.substring(0, 15) + '...')
  
  try {
    console.log('🎨 Testing Stability AI image generation...')
    
    const response = await fetch('https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${stabilityKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text_prompts: [
          {
            text: 'A colorful educational diagram showing the solar system with planets, bright colors, child-friendly, high quality, detailed',
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
        console.log('✅ SUCCESS! Stability AI is working with the new API key')
        console.log('📊 Image Details:')
        console.log('   - Generated successfully')
        console.log('   - Base64 length:', data.artifacts[0].base64.length, 'characters')
        console.log('   - Seed:', data.artifacts[0].seed)
        console.log('   - Finish reason:', data.artifacts[0].finishReason)
        return true
      } else {
        console.log('❌ Stability AI returned no image data')
        console.log('Response:', JSON.stringify(data, null, 2))
        return false
      }
    } else {
      const errorText = await response.text()
      console.log('❌ Stability AI API error:', response.status)
      console.log('Error details:', errorText)
      return false
    }
  } catch (error) {
    console.log('❌ Stability AI API connection error:', error)
    return false
  }
}

async function testImageGenerationAPI() {
  console.log('\n🔗 Testing our image generation API endpoint...')
  
  try {
    const response = await fetch('http://localhost:3000/api/ai/generate-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': 'next-auth.session-token=test' // Mock session for testing
      },
      body: JSON.stringify({
        prompt: 'A simple educational diagram showing the water cycle with clouds, rain, and rivers',
        style: 'educational'
      })
    })

    console.log('Local API Response Status:', response.status)
    
    if (response.ok) {
      const data = await response.json()
      console.log('✅ Local image generation API working!')
      console.log('📊 Response Details:')
      console.log('   - Success:', data.success)
      console.log('   - Source:', data.source)
      console.log('   - Has Image URL:', !!data.imageUrl)
      
      if (data.source === 'stability-ai') {
        console.log('🎉 EXCELLENT! Real AI images are now being generated!')
      } else if (data.source === 'placeholder') {
        console.log('⚠️  Still using placeholders - API might need restart')
      }
      
      if (data.message) {
        console.log('   - Message:', data.message)
      }
      
      return data.source === 'stability-ai'
    } else {
      const errorData = await response.json()
      console.log('❌ Local API Error:', errorData)
      return false
    }
  } catch (error) {
    console.log('❌ Local API connection error:', error)
    return false
  }
}

async function runTest() {
  console.log('🚀 Starting Stability AI API Key Test...\n')
  
  const stabilityWorking = await testStabilityAI()
  const localAPIWorking = await testImageGenerationAPI()
  
  console.log('\n📊 Test Results Summary:')
  console.log('=' .repeat(50))
  console.log('- Stability AI Direct:', stabilityWorking ? '✅ Working' : '❌ Not Working')
  console.log('- Local API Endpoint:', localAPIWorking ? '✅ Using AI Images' : '⚠️  Using Placeholders')
  
  if (stabilityWorking && localAPIWorking) {
    console.log('\n🎉 PERFECT! Everything is working!')
    console.log('✅ Real AI-generated images are now being created')
    console.log('✅ PowerPoint presentations will have actual AI images')
    console.log('✅ No more placeholder images needed')
  } else if (stabilityWorking && !localAPIWorking) {
    console.log('\n⚠️  Stability AI works, but local API still using placeholders')
    console.log('💡 Try restarting the development server:')
    console.log('   1. Stop the current server (Ctrl+C)')
    console.log('   2. Run: npm run dev')
    console.log('   3. Test again')
  } else if (!stabilityWorking) {
    console.log('\n❌ Stability AI API key issue')
    console.log('💡 Possible solutions:')
    console.log('   1. Check if the API key is correct')
    console.log('   2. Verify account has sufficient credits')
    console.log('   3. Check Stability AI service status')
  }
  
  console.log('\n🎯 Next Steps:')
  if (stabilityWorking) {
    console.log('1. ✅ API key is working - test PowerPoint generation')
    console.log('2. 🎨 Create a presentation and verify AI images appear')
    console.log('3. 🚀 Deploy to production with working AI images')
  } else {
    console.log('1. 🔍 Debug the API key or account issues')
    console.log('2. 💳 Check Stability AI account balance')
    console.log('3. 🔄 Fallback system will continue using placeholders')
  }
}

runTest().catch(console.error)