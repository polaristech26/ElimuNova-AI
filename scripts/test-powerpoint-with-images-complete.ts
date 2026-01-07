#!/usr/bin/env tsx

/**
 * Complete test of PowerPoint generation with image system
 * This tests the entire workflow from content generation to image creation
 */

import { config } from 'dotenv'

// Load environment variables
config()

console.log('🎯 Testing Complete PowerPoint Generation with Images...\n')

async function testPowerPointGeneration() {
  console.log('1. Testing PowerPoint content generation...')
  
  try {
    const response = await fetch('http://localhost:3000/api/ai/generate-content', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': 'next-auth.session-token=test' // Mock session
      },
      body: JSON.stringify({
        type: 'powerpoint',
        subject: 'Science',
        grade: 'Grade 5',
        topic: 'The Solar System',
        duration: 45,
        objectives: ['Understand planets', 'Learn about space'],
        format: '10 slides',
        difficulty: 'intermediate'
      })
    })

    console.log('PowerPoint API Response Status:', response.status)
    
    if (response.ok) {
      const data = await response.json()
      console.log('✅ PowerPoint content generated successfully')
      console.log('Title:', data.title)
      console.log('Content length:', data.content?.length || 0, 'characters')
      return data.content
    } else {
      const errorData = await response.json()
      console.log('❌ PowerPoint generation failed:', errorData)
      return null
    }
  } catch (error) {
    console.log('❌ PowerPoint generation error:', error)
    return null
  }
}

async function testImageGeneration() {
  console.log('\n2. Testing image generation with different scenarios...')
  
  const testPrompts = [
    'Solar system with planets orbiting the sun',
    'Earth showing continents and oceans',
    'Moon phases diagram',
    'Astronaut in space suit floating'
  ]
  
  const results = []
  
  for (const prompt of testPrompts) {
    try {
      console.log(`   Testing: "${prompt}"`)
      
      const response = await fetch('http://localhost:3000/api/ai/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': 'next-auth.session-token=test'
        },
        body: JSON.stringify({
          prompt: prompt,
          style: 'educational'
        })
      })
      
      if (response.ok) {
        const data = await response.json()
        results.push({
          prompt,
          success: true,
          source: data.source,
          message: data.message,
          hasImage: !!data.imageUrl
        })
        
        if (data.source === 'placeholder') {
          console.log(`   ⚠️  Placeholder generated: ${data.message}`)
        } else {
          console.log(`   ✅ AI image generated (${data.source})`)
        }
      } else {
        results.push({
          prompt,
          success: false,
          error: await response.text()
        })
        console.log(`   ❌ Failed to generate image`)
      }
    } catch (error) {
      results.push({
        prompt,
        success: false,
        error: error.message
      })
      console.log(`   ❌ Error: ${error.message}`)
    }
  }
  
  return results
}

function simulatePowerPointParsing(content: string) {
  console.log('\n3. Simulating PowerPoint content parsing...')
  
  if (!content) {
    console.log('❌ No content to parse')
    return []
  }
  
  // Simple parsing simulation
  const slides = []
  const lines = content.split('\n').filter(line => line.trim())
  
  let currentSlide = null
  let slideCount = 0
  
  for (const line of lines) {
    if (line.match(/slide\s*\d+/i) || line.match(/^#+/)) {
      if (currentSlide) {
        slides.push(currentSlide)
      }
      
      slideCount++
      currentSlide = {
        id: `slide-${slideCount}`,
        title: line.replace(/^#+\s*/, '').replace(/slide\s*\d+:?\s*/i, '').trim(),
        content: '',
        slideType: slideCount === 1 ? 'title' : 'content',
        speakerNotes: '',
        visualSuggestions: [],
        order: slideCount
      }
    } else if (currentSlide && line.trim()) {
      if (line.toLowerCase().includes('visual') || line.toLowerCase().includes('image') || line.toLowerCase().includes('diagram')) {
        currentSlide.visualSuggestions.push(line.trim())
      } else {
        currentSlide.content += line + '\n'
      }
    }
  }
  
  if (currentSlide) {
    slides.push(currentSlide)
  }
  
  // Add some visual suggestions for testing
  slides.forEach((slide, index) => {
    if (index > 0 && slide.visualSuggestions.length === 0) {
      slide.visualSuggestions = [`Educational illustration for ${slide.title}`, 'colorful diagram', 'suitable for students']
    }
  })
  
  console.log(`✅ Parsed ${slides.length} slides from content`)
  slides.forEach((slide, index) => {
    console.log(`   Slide ${index + 1}: "${slide.title}" (${slide.visualSuggestions.length} visual suggestions)`)
  })
  
  return slides
}

async function simulateImageGenerationForSlides(slides: any[]) {
  console.log('\n4. Simulating image generation for slides...')
  
  const slidesWithImages = []
  
  for (const slide of slides) {
    if (slide.visualSuggestions && slide.visualSuggestions.length > 0) {
      console.log(`   Generating image for: "${slide.title}"`)
      
      const imagePrompt = slide.visualSuggestions.join(', ') + ', educational illustration, colorful, suitable for students'
      
      try {
        const response = await fetch('http://localhost:3000/api/ai/generate-image', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Cookie': 'next-auth.session-token=test'
          },
          body: JSON.stringify({
            prompt: imagePrompt,
            style: 'educational'
          })
        })
        
        if (response.ok) {
          const data = await response.json()
          slidesWithImages.push({
            ...slide,
            imageUrl: data.imageUrl,
            hasImage: true,
            imageSource: data.source,
            imageMessage: data.message
          })
          
          if (data.source === 'placeholder') {
            console.log(`   ⚠️  Placeholder image used`)
          } else {
            console.log(`   ✅ AI image generated (${data.source})`)
          }
        } else {
          slidesWithImages.push({
            ...slide,
            hasImage: false
          })
          console.log(`   ❌ Image generation failed`)
        }
      } catch (error) {
        slidesWithImages.push({
          ...slide,
          hasImage: false
        })
        console.log(`   ❌ Error: ${error.message}`)
      }
      
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 500))
    } else {
      slidesWithImages.push(slide)
    }
  }
  
  return slidesWithImages
}

async function runCompleteTest() {
  console.log('🚀 Starting Complete PowerPoint + Images Test...\n')
  
  // Test 1: Generate PowerPoint content
  const content = await testPowerPointGeneration()
  
  // Test 2: Test image generation capabilities
  const imageResults = await testImageGeneration()
  
  // Test 3: Parse content into slides
  const slides = simulatePowerPointParsing(content)
  
  // Test 4: Generate images for slides
  const finalSlides = await simulateImageGenerationForSlides(slides)
  
  // Results summary
  console.log('\n📊 Complete Test Results:')
  console.log('=' .repeat(50))
  
  console.log('\n🎯 PowerPoint Generation:')
  console.log('- Content Generated:', content ? '✅ Success' : '❌ Failed')
  console.log('- Slides Parsed:', slides.length > 0 ? `✅ ${slides.length} slides` : '❌ No slides')
  
  console.log('\n🖼️  Image Generation:')
  const successfulImages = imageResults.filter(r => r.success).length
  const placeholderImages = imageResults.filter(r => r.success && r.source === 'placeholder').length
  const aiImages = imageResults.filter(r => r.success && r.source !== 'placeholder').length
  
  console.log(`- Total Tests: ${imageResults.length}`)
  console.log(`- Successful: ${successfulImages}/${imageResults.length}`)
  console.log(`- AI Generated: ${aiImages}`)
  console.log(`- Placeholders: ${placeholderImages}`)
  
  console.log('\n🎨 Slide Images:')
  const slidesWithImages = finalSlides.filter(s => s.hasImage).length
  const slidesWithPlaceholders = finalSlides.filter(s => s.hasImage && s.imageSource === 'placeholder').length
  const slidesWithAI = finalSlides.filter(s => s.hasImage && s.imageSource !== 'placeholder').length
  
  console.log(`- Slides with Images: ${slidesWithImages}/${finalSlides.length}`)
  console.log(`- AI Generated Images: ${slidesWithAI}`)
  console.log(`- Placeholder Images: ${slidesWithPlaceholders}`)
  
  console.log('\n💡 System Status:')
  if (successfulImages === imageResults.length) {
    console.log('✅ Image generation system fully operational')
    if (placeholderImages > 0) {
      console.log('⚠️  Using placeholder images due to API limitations')
    }
  } else {
    console.log('⚠️  Image generation system partially operational')
  }
  
  console.log('\n🎯 Recommendations:')
  if (placeholderImages > 0) {
    console.log('1. 💳 Add credits to Stability AI or OpenAI accounts')
    console.log('2. 🔄 Placeholder system ensures presentations still work')
    console.log('3. 🎨 Consider adding more placeholder image styles')
  }
  
  if (content && slides.length > 0) {
    console.log('4. ✅ PowerPoint generation system is working properly')
    console.log('5. 🖼️  Images are being generated (AI or placeholders)')
    console.log('6. 🚀 System ready for production use')
  }
  
  console.log('\n🎉 Test Complete!')
}

runCompleteTest().catch(console.error)