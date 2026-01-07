#!/usr/bin/env tsx

/**
 * Test AI image generation end-to-end with the new API key
 */

import { config } from 'dotenv'

// Load environment variables
config()

console.log('🎨 Testing AI Image Generation End-to-End...\n')

// Simulate the image generation function from our API
async function testImageGenerationDirect() {
  const stabilityKey = process.env.STABILITY_API_KEY
  
  console.log('1. Testing direct image generation (simulating API route)...')
  
  const prompt = 'A colorful educational diagram showing the solar system with planets orbiting the sun, bright colors, child-friendly, high quality, detailed, professional'
  
  try {
    // Try Stability AI first (same logic as our API)
    const stabilityResponse = await fetch('https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${stabilityKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text_prompts: [
          {
            text: prompt,
            weight: 1
          }
        ],
        cfg_scale: 7,
        height: 1024,
        width: 1024,
        samples: 1,
        steps: 30,
      }),
    })

    if (stabilityResponse.ok) {
      const data = await stabilityResponse.json()
      if (data.artifacts && data.artifacts[0]) {
        const imageUrl = `data:image/png;base64,${data.artifacts[0].base64}`
        
        console.log('✅ SUCCESS! AI image generated successfully')
        console.log('📊 Image Details:')
        console.log('   - Source: Stability AI')
        console.log('   - Format: PNG (Base64)')
        console.log('   - Size: ~' + Math.round(data.artifacts[0].base64.length / 1024) + 'KB')
        console.log('   - Seed:', data.artifacts[0].seed)
        
        return {
          imageUrl: imageUrl,
          success: true,
          source: 'stability-ai'
        }
      }
    } else {
      const errorText = await stabilityResponse.text()
      console.log('❌ Stability AI error:', stabilityResponse.status, errorText)
    }
  } catch (error) {
    console.log('❌ Stability AI connection error:', error)
  }
  
  return { success: false }
}

async function testMultipleImageGeneration() {
  console.log('\n2. Testing multiple educational images...')
  
  const testPrompts = [
    'Mathematical equations and formulas on a blackboard, educational style',
    'Human body anatomy diagram showing organs, colorful and educational',
    'World map showing continents and oceans, bright educational colors',
    'Plant life cycle from seed to flower, educational illustration'
  ]
  
  const results = []
  
  for (let i = 0; i < testPrompts.length; i++) {
    const prompt = testPrompts[i]
    console.log(`   Testing ${i + 1}/4: "${prompt.substring(0, 40)}..."`)
    
    try {
      const stabilityKey = process.env.STABILITY_API_KEY
      
      const response = await fetch('https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${stabilityKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text_prompts: [
            {
              text: prompt + ', educational illustration, bright colors, child-friendly, high quality',
              weight: 1
            }
          ],
          cfg_scale: 7,
          height: 1024,
          width: 1024,
          samples: 1,
          steps: 20, // Faster for testing
        }),
      })

      if (response.ok) {
        const data = await response.json()
        if (data.artifacts && data.artifacts[0]) {
          results.push({
            prompt: prompt,
            success: true,
            size: Math.round(data.artifacts[0].base64.length / 1024),
            seed: data.artifacts[0].seed
          })
          console.log(`   ✅ Generated successfully (${Math.round(data.artifacts[0].base64.length / 1024)}KB)`)
        } else {
          results.push({ prompt: prompt, success: false, error: 'No image data' })
          console.log(`   ❌ No image data returned`)
        }
      } else {
        const errorText = await response.text()
        results.push({ prompt: prompt, success: false, error: errorText })
        console.log(`   ❌ API error: ${response.status}`)
      }
    } catch (error) {
      results.push({ prompt: prompt, success: false, error: error.message })
      console.log(`   ❌ Connection error: ${error.message}`)
    }
    
    // Small delay between requests
    if (i < testPrompts.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  }
  
  return results
}

async function runCompleteTest() {
  console.log('🚀 Starting Complete AI Image Generation Test...\n')
  
  // Test 1: Single image generation
  const singleResult = await testImageGenerationDirect()
  
  // Test 2: Multiple images
  const multipleResults = await testMultipleImageGeneration()
  
  // Results summary
  console.log('\n📊 Complete Test Results:')
  console.log('=' .repeat(60))
  
  console.log('\n🎯 Single Image Test:')
  if (singleResult.success) {
    console.log('✅ SUCCESS - AI image generation working perfectly')
    console.log(`   Source: ${singleResult.source}`)
  } else {
    console.log('❌ FAILED - Single image generation not working')
  }
  
  console.log('\n🎨 Multiple Images Test:')
  const successCount = multipleResults.filter(r => r.success).length
  console.log(`✅ Success Rate: ${successCount}/${multipleResults.length} (${Math.round(successCount/multipleResults.length*100)}%)`)
  
  if (successCount > 0) {
    const avgSize = Math.round(
      multipleResults
        .filter(r => r.success)
        .reduce((sum, r) => sum + r.size, 0) / successCount
    )
    console.log(`📊 Average Image Size: ${avgSize}KB`)
  }
  
  console.log('\n💡 System Status:')
  if (singleResult.success && successCount >= 3) {
    console.log('🎉 EXCELLENT! AI image generation is fully operational')
    console.log('✅ Stability AI API key is working perfectly')
    console.log('✅ Multiple images can be generated successfully')
    console.log('✅ PowerPoint presentations will now have real AI images')
    console.log('✅ No more placeholder images needed!')
  } else if (singleResult.success) {
    console.log('⚠️  AI image generation is working but may have rate limits')
    console.log('✅ Single images work fine')
    console.log('⚠️  Multiple rapid requests may be throttled')
  } else {
    console.log('❌ AI image generation is not working')
    console.log('🔍 Check API key and account status')
  }
  
  console.log('\n🎯 Next Steps:')
  if (singleResult.success) {
    console.log('1. ✅ Test PowerPoint generation with real AI images')
    console.log('2. 🎨 Verify images appear in slide previews')
    console.log('3. 🚀 Update production environment with new API key')
    console.log('4. 📊 Monitor API usage and costs')
  } else {
    console.log('1. 🔍 Debug API key or account issues')
    console.log('2. 💳 Check Stability AI account balance and limits')
    console.log('3. 🔄 Fallback system will continue using placeholders')
  }
  
  console.log('\n🎉 Test Complete!')
}

runCompleteTest().catch(console.error)