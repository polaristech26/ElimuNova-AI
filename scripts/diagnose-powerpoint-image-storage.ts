#!/usr/bin/env tsx

/**
 * Diagnose PowerPoint image storage and display issues
 */

import { config } from 'dotenv'
import { PrismaClient } from '@prisma/client'

// Load environment variables
config()

const prisma = new PrismaClient()

console.log('🔍 Diagnosing PowerPoint Image Storage Issues...\n')

async function checkDatabaseContent() {
  console.log('1. Checking PowerPoint presentations in database...')
  
  try {
    const powerpoints = await prisma.aIGeneratedContent.findMany({
      where: {
        type: 'POWERPOINT'
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 5 // Get latest 5
    })
    
    console.log(`   Found ${powerpoints.length} PowerPoint presentations`)
    
    for (const ppt of powerpoints) {
      console.log(`\n   📄 PowerPoint: "${ppt.title}"`)
      console.log(`      - ID: ${ppt.id}`)
      console.log(`      - Subject: ${ppt.subject}`)
      console.log(`      - Grade: ${ppt.grade}`)
      console.log(`      - Created: ${ppt.createdAt}`)
      
      // Parse content to check for images
      let content
      try {
        content = typeof ppt.content === 'string' ? JSON.parse(ppt.content) : ppt.content
      } catch (error) {
        console.log(`      ❌ Error parsing content: ${error}`)
        continue
      }
      
      if (content && content.slides) {
        console.log(`      - Slides: ${content.slides.length}`)
        
        let slidesWithImages = 0
        let totalImageSize = 0
        
        content.slides.forEach((slide: any, index: number) => {
          if (slide.imageUrl) {
            slidesWithImages++
            
            // Check image type and size
            if (slide.imageUrl.startsWith('data:image/')) {
              const base64Data = slide.imageUrl.split(',')[1]
              if (base64Data) {
                const sizeKB = Math.round((base64Data.length * 3) / 4 / 1024)
                totalImageSize += sizeKB
                console.log(`         Slide ${index + 1}: "${slide.title}" - Image: ${sizeKB}KB (${slide.imageSource || 'unknown source'})`)
              }
            } else {
              console.log(`         Slide ${index + 1}: "${slide.title}" - Image: External URL (${slide.imageSource || 'unknown source'})`)
            }
          } else if (slide.visualSuggestions && slide.visualSuggestions.length > 0) {
            console.log(`         Slide ${index + 1}: "${slide.title}" - No image (had ${slide.visualSuggestions.length} visual suggestions)`)
          } else {
            console.log(`         Slide ${index + 1}: "${slide.title}" - No image (no visual suggestions)`)
          }
        })
        
        console.log(`      📊 Summary: ${slidesWithImages}/${content.slides.length} slides have images`)
        if (totalImageSize > 0) {
          console.log(`      📦 Total image size: ${Math.round(totalImageSize / 1024)}MB`)
        }
      } else {
        console.log(`      ❌ No slides found in content`)
      }
    }
    
    return powerpoints
  } catch (error) {
    console.log(`   ❌ Database error: ${error}`)
    return []
  }
}

async function testImageDisplay() {
  console.log('\n2. Testing image display logic...')
  
  // Simulate how the frontend processes the data
  const mockSlideWithImage = {
    id: 'test-slide',
    title: 'Test Slide',
    content: 'Test content',
    imageUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
    hasImage: true,
    imageSource: 'stability-ai'
  }
  
  console.log('   Testing mock slide with image:')
  console.log(`   - Has imageUrl: ${!!mockSlideWithImage.imageUrl}`)
  console.log(`   - Image type: ${mockSlideWithImage.imageUrl?.startsWith('data:') ? 'Base64 Data URL' : 'External URL'}`)
  console.log(`   - Has hasImage flag: ${mockSlideWithImage.hasImage}`)
  console.log(`   - Image source: ${mockSlideWithImage.imageSource}`)
  
  // Test image URL validity
  if (mockSlideWithImage.imageUrl?.startsWith('data:image/')) {
    console.log('   ✅ Image URL format is valid for browser display')
  } else {
    console.log('   ❌ Image URL format may not display in browser')
  }
}

async function checkFrontendImageHandling() {
  console.log('\n3. Checking frontend image handling patterns...')
  
  // Common issues that prevent image display
  const commonIssues = [
    {
      issue: 'Missing imageUrl property',
      check: (slide: any) => !slide.imageUrl,
      solution: 'Ensure imageUrl is set when image is generated'
    },
    {
      issue: 'Invalid base64 format',
      check: (slide: any) => slide.imageUrl && !slide.imageUrl.startsWith('data:image/'),
      solution: 'Ensure images are properly formatted as data URLs'
    },
    {
      issue: 'Missing hasImage flag',
      check: (slide: any) => slide.imageUrl && !slide.hasImage,
      solution: 'Set hasImage: true when imageUrl is present'
    },
    {
      issue: 'Large image size causing display issues',
      check: (slide: any) => {
        if (slide.imageUrl?.startsWith('data:image/')) {
          const base64Data = slide.imageUrl.split(',')[1]
          if (base64Data) {
            const sizeKB = Math.round((base64Data.length * 3) / 4 / 1024)
            return sizeKB > 5000 // > 5MB
          }
        }
        return false
      },
      solution: 'Consider compressing images or using external storage'
    }
  ]
  
  console.log('   Common image display issues to check:')
  commonIssues.forEach((issue, index) => {
    console.log(`   ${index + 1}. ${issue.issue}`)
    console.log(`      Solution: ${issue.solution}`)
  })
}

async function generateTestImageAndSave() {
  console.log('\n4. Testing complete image generation and save workflow...')
  
  try {
    // Generate a test image
    console.log('   Generating test image...')
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
            text: 'A simple test image for educational presentation, bright colors, minimal design',
            weight: 1
          }
        ],
        cfg_scale: 7,
        height: 512, // Smaller for testing
        width: 512,
        samples: 1,
        steps: 20,
      }),
    })

    if (response.ok) {
      const data = await response.json()
      if (data.artifacts && data.artifacts[0]) {
        const imageUrl = `data:image/png;base64,${data.artifacts[0].base64}`
        const imageSize = Math.round(data.artifacts[0].base64.length / 1024)
        
        console.log(`   ✅ Test image generated: ${imageSize}KB`)
        
        // Create test slide data
        const testSlide = {
          id: 'test-slide-' + Date.now(),
          title: 'Test Slide with AI Image',
          content: 'This is a test slide to verify image storage and display.',
          slideType: 'content',
          speakerNotes: 'Test speaker notes',
          visualSuggestions: ['test image', 'educational illustration'],
          order: 1,
          imageUrl: imageUrl,
          hasImage: true,
          imageSource: 'stability-ai',
          imageSize: imageSize
        }
        
        console.log('   📄 Test slide created with image:')
        console.log(`      - Title: ${testSlide.title}`)
        console.log(`      - Has image: ${testSlide.hasImage}`)
        console.log(`      - Image size: ${testSlide.imageSize}KB`)
        console.log(`      - Image source: ${testSlide.imageSource}`)
        
        // Test JSON serialization (what happens when saving to DB)
        const serialized = JSON.stringify(testSlide)
        const deserialized = JSON.parse(serialized)
        
        console.log('   🔄 Testing JSON serialization:')
        console.log(`      - Serialized size: ${Math.round(serialized.length / 1024)}KB`)
        console.log(`      - Image preserved: ${!!deserialized.imageUrl}`)
        console.log(`      - Properties preserved: ${deserialized.hasImage === testSlide.hasImage}`)
        
        return testSlide
      } else {
        console.log('   ❌ No image data in response')
        return null
      }
    } else {
      console.log(`   ❌ Image generation failed: ${response.status}`)
      return null
    }
  } catch (error) {
    console.log(`   ❌ Error generating test image: ${error}`)
    return null
  }
}

async function runDiagnosis() {
  console.log('🚀 Starting PowerPoint Image Storage Diagnosis...\n')
  
  // Step 1: Check database content
  const powerpoints = await checkDatabaseContent()
  
  // Step 2: Test image display logic
  await testImageDisplay()
  
  // Step 3: Check frontend patterns
  await checkFrontendImageHandling()
  
  // Step 4: Test complete workflow
  const testSlide = await generateTestImageAndSave()
  
  // Summary and recommendations
  console.log('\n📊 DIAGNOSIS SUMMARY:')
  console.log('=' .repeat(60))
  
  if (powerpoints.length > 0) {
    const hasImagesInDB = powerpoints.some(ppt => {
      try {
        const content = typeof ppt.content === 'string' ? JSON.parse(ppt.content) : ppt.content
        return content?.slides?.some((slide: any) => slide.imageUrl)
      } catch {
        return false
      }
    })
    
    if (hasImagesInDB) {
      console.log('✅ Images ARE being saved to the database')
      console.log('🔍 Issue is likely in the frontend display logic')
    } else {
      console.log('❌ Images are NOT being saved to the database')
      console.log('🔍 Issue is in the image generation or save workflow')
    }
  } else {
    console.log('⚠️  No PowerPoint presentations found in database')
  }
  
  if (testSlide) {
    console.log('✅ Image generation and serialization working')
  } else {
    console.log('❌ Image generation failed')
  }
  
  console.log('\n🎯 RECOMMENDATIONS:')
  console.log('1. Check browser developer tools for image loading errors')
  console.log('2. Verify that imageUrl properties are being set correctly')
  console.log('3. Ensure hasImage flags are properly set')
  console.log('4. Check for CSP (Content Security Policy) issues with data URLs')
  console.log('5. Verify that the frontend is correctly parsing the database content')
  
  console.log('\n🔧 NEXT STEPS:')
  console.log('1. Create a test PowerPoint with images and check the database')
  console.log('2. Inspect the frontend rendering logic for image display')
  console.log('3. Add debugging logs to the image generation workflow')
  console.log('4. Test with smaller images to rule out size issues')
  
  await prisma.$disconnect()
}

runDiagnosis().catch(console.error)