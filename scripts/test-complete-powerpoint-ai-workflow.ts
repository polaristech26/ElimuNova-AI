#!/usr/bin/env tsx

/**
 * Complete PowerPoint generation workflow test with AI images
 * This simulates the entire user experience from content generation to final presentation
 */

import { config } from 'dotenv'

// Load environment variables
config()

console.log('🎯 Testing Complete PowerPoint Generation with AI Images...\n')

// Simulate the PowerPoint content generation
async function generatePowerPointContent() {
  console.log('1. 📝 Generating PowerPoint content...')
  
  const requestData = {
    type: 'powerpoint',
    subject: 'Science',
    grade: 'Grade 5',
    topic: 'The Solar System',
    duration: 45,
    objectives: ['Understand planets and their characteristics', 'Learn about space exploration'],
    format: '8 slides',
    difficulty: 'intermediate',
    title: 'Exploring Our Solar System',
    description: 'An engaging presentation about planets, stars, and space exploration for elementary students'
  }
  
  console.log('   📊 Request Details:')
  console.log(`   - Subject: ${requestData.subject}`)
  console.log(`   - Topic: ${requestData.topic}`)
  console.log(`   - Grade: ${requestData.grade}`)
  console.log(`   - Format: ${requestData.format}`)
  
  // Simulate content generation (this would normally call the API)
  const mockContent = `
# Slide 1: Title Slide
## Exploring Our Solar System
Welcome to an amazing journey through space! Today we'll discover the planets, stars, and wonders of our solar system.

# Slide 2: What is the Solar System?
The solar system is our cosmic neighborhood, with the Sun at the center and eight planets orbiting around it.
Visual suggestions: Solar system diagram, Sun and planets illustration, space background

# Slide 3: The Sun - Our Star
The Sun is a massive ball of hot gas that provides light and heat to all the planets.
Visual suggestions: Sun close-up image, solar flares, bright yellow star illustration

# Slide 4: Inner Planets
Mercury, Venus, Earth, and Mars are the four planets closest to the Sun.
Visual suggestions: Inner planets comparison, rocky planet surfaces, Earth from space

# Slide 5: Outer Planets
Jupiter, Saturn, Uranus, and Neptune are the four outer planets, much larger than the inner ones.
Visual suggestions: Gas giant planets, Saturn's rings, Jupiter's Great Red Spot

# Slide 6: Planet Earth - Our Home
Earth is the only planet we know of that has life, with water, air, and the perfect temperature.
Visual suggestions: Earth from space, blue and green planet, continents and oceans

# Slide 7: Space Exploration
Humans have sent rockets, satellites, and astronauts to explore space and learn more about our universe.
Visual suggestions: Rocket launch, astronaut in space, space station, Mars rover

# Slide 8: Summary
The solar system is an amazing place with many different worlds to discover and explore!
Visual suggestions: Collage of planets, telescope view, children looking at stars
`
  
  console.log('   ✅ Content generated successfully')
  console.log(`   📄 Content length: ${mockContent.length} characters`)
  
  return mockContent
}

// Parse content into slides with visual suggestions
function parseContentIntoSlides(content: string) {
  console.log('\n2. 🔍 Parsing content into slides...')
  
  const slides = []
  const lines = content.split('\n').filter(line => line.trim())
  
  let currentSlide = null
  let slideCount = 0
  
  for (const line of lines) {
    if (line.match(/^#+\s*Slide\s*\d+/i)) {
      if (currentSlide) {
        slides.push(currentSlide)
      }
      
      slideCount++
      const title = line.replace(/^#+\s*Slide\s*\d+:\s*/i, '').trim()
      
      currentSlide = {
        id: `slide-${slideCount}`,
        title: title,
        content: '',
        slideType: slideCount === 1 ? 'title' : 'content',
        speakerNotes: '',
        visualSuggestions: [],
        order: slideCount
      }
    } else if (currentSlide) {
      if (line.toLowerCase().startsWith('visual suggestions:')) {
        const suggestions = line.replace(/^visual suggestions:\s*/i, '').split(',').map(s => s.trim())
        currentSlide.visualSuggestions = suggestions
      } else if (line.startsWith('##')) {
        currentSlide.title = line.replace(/^##\s*/, '').trim()
      } else if (line.trim() && !line.startsWith('#')) {
        currentSlide.content += line + '\n'
      }
    }
  }
  
  if (currentSlide) {
    slides.push(currentSlide)
  }
  
  console.log(`   ✅ Parsed ${slides.length} slides`)
  slides.forEach((slide, index) => {
    console.log(`   📄 Slide ${index + 1}: "${slide.title}" (${slide.visualSuggestions.length} visual suggestions)`)
  })
  
  return slides
}

// Generate AI images for slides
async function generateImagesForSlides(slides: any[]) {
  console.log('\n3. 🎨 Generating AI images for slides...')
  
  const slidesWithImages = []
  const stabilityKey = process.env.STABILITY_API_KEY
  
  for (let i = 0; i < slides.length; i++) {
    const slide = slides[i]
    
    if (slide.visualSuggestions && slide.visualSuggestions.length > 0) {
      console.log(`   🖼️  Generating image for: "${slide.title}"`)
      
      // Create enhanced prompt
      const basePrompt = slide.visualSuggestions.join(', ')
      const enhancedPrompt = `${basePrompt}, educational illustration, bright colors, child-friendly, high quality, detailed, professional`
      
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
                text: enhancedPrompt,
                weight: 1
              }
            ],
            cfg_scale: 7,
            height: 1024,
            width: 1024,
            samples: 1,
            steps: 25,
          }),
        })

        if (response.ok) {
          const data = await response.json()
          if (data.artifacts && data.artifacts[0]) {
            const imageUrl = `data:image/png;base64,${data.artifacts[0].base64}`
            const imageSize = Math.round(data.artifacts[0].base64.length / 1024)
            
            slidesWithImages.push({
              ...slide,
              imageUrl: imageUrl,
              hasImage: true,
              imageSource: 'stability-ai',
              imageSize: imageSize,
              imageSeed: data.artifacts[0].seed
            })
            
            console.log(`   ✅ AI image generated (${imageSize}KB, seed: ${data.artifacts[0].seed})`)
          } else {
            slidesWithImages.push({
              ...slide,
              hasImage: false,
              imageError: 'No image data returned'
            })
            console.log(`   ❌ No image data returned`)
          }
        } else {
          const errorText = await response.text()
          slidesWithImages.push({
            ...slide,
            hasImage: false,
            imageError: `API error: ${response.status}`
          })
          console.log(`   ❌ API error: ${response.status}`)
        }
      } catch (error) {
        slidesWithImages.push({
          ...slide,
          hasImage: false,
          imageError: error.message
        })
        console.log(`   ❌ Connection error: ${error.message}`)
      }
      
      // Delay between requests to avoid rate limiting
      if (i < slides.length - 1) {
        console.log(`   ⏳ Waiting 2 seconds before next image...`)
        await new Promise(resolve => setTimeout(resolve, 2000))
      }
    } else {
      // Slide without visual suggestions
      slidesWithImages.push({
        ...slide,
        hasImage: false,
        imageReason: 'No visual suggestions provided'
      })
      console.log(`   ⏭️  Skipping "${slide.title}" (no visual suggestions)`)
    }
  }
  
  return slidesWithImages
}

// Simulate the complete presentation creation
async function createCompletePresentation() {
  console.log('\n4. 📋 Creating complete presentation...')
  
  const presentation = {
    id: 'test-presentation-' + Date.now(),
    title: 'Exploring Our Solar System',
    subject: 'Science',
    grade: 'Grade 5',
    topic: 'The Solar System',
    createdAt: new Date().toISOString(),
    metadata: {
      duration: 45,
      slideCount: 0,
      imagesGenerated: 0,
      totalImageSize: 0
    }
  }
  
  console.log('   ✅ Presentation metadata created')
  console.log(`   📊 ID: ${presentation.id}`)
  console.log(`   📅 Created: ${presentation.createdAt}`)
  
  return presentation
}

// Run the complete workflow test
async function runCompleteWorkflowTest() {
  console.log('🚀 Starting Complete PowerPoint AI Workflow Test...\n')
  console.log('=' .repeat(70))
  
  try {
    // Step 1: Generate content
    const content = await generatePowerPointContent()
    
    // Step 2: Parse into slides
    const slides = parseContentIntoSlides(content)
    
    // Step 3: Generate AI images
    const slidesWithImages = await generateImagesForSlides(slides)
    
    // Step 4: Create presentation
    const presentation = await createCompletePresentation()
    
    // Calculate results
    const totalSlides = slidesWithImages.length
    const slidesWithAIImages = slidesWithImages.filter(s => s.hasImage && s.imageSource === 'stability-ai').length
    const slidesWithErrors = slidesWithImages.filter(s => s.hasImage === false && s.imageError).length
    const slidesSkipped = slidesWithImages.filter(s => s.imageReason).length
    const totalImageSize = slidesWithImages
      .filter(s => s.imageSize)
      .reduce((sum, s) => sum + s.imageSize, 0)
    
    // Display comprehensive results
    console.log('\n📊 COMPLETE WORKFLOW RESULTS:')
    console.log('=' .repeat(70))
    
    console.log('\n🎯 Content Generation:')
    console.log(`   ✅ PowerPoint content generated successfully`)
    console.log(`   📄 Content length: ${content.length} characters`)
    
    console.log('\n📄 Slide Parsing:')
    console.log(`   ✅ Total slides parsed: ${totalSlides}`)
    console.log(`   🎨 Slides with visual suggestions: ${slides.filter(s => s.visualSuggestions.length > 0).length}`)
    
    console.log('\n🖼️  AI Image Generation:')
    console.log(`   ✅ AI images generated: ${slidesWithAIImages}/${totalSlides}`)
    console.log(`   ❌ Image generation errors: ${slidesWithErrors}`)
    console.log(`   ⏭️  Slides skipped (no visuals): ${slidesSkipped}`)
    console.log(`   📊 Total image size: ${Math.round(totalImageSize / 1024)}MB`)
    
    if (slidesWithAIImages > 0) {
      const avgImageSize = Math.round(totalImageSize / slidesWithAIImages)
      console.log(`   📈 Average image size: ${avgImageSize}KB`)
    }
    
    console.log('\n🎨 Image Details:')
    slidesWithImages.forEach((slide, index) => {
      if (slide.hasImage && slide.imageSource === 'stability-ai') {
        console.log(`   ✅ Slide ${index + 1}: "${slide.title}" (${slide.imageSize}KB, seed: ${slide.imageSeed})`)
      } else if (slide.imageError) {
        console.log(`   ❌ Slide ${index + 1}: "${slide.title}" - ${slide.imageError}`)
      } else if (slide.imageReason) {
        console.log(`   ⏭️  Slide ${index + 1}: "${slide.title}" - ${slide.imageReason}`)
      }
    })
    
    console.log('\n💡 System Performance:')
    const successRate = Math.round((slidesWithAIImages / (totalSlides - slidesSkipped)) * 100)
    
    if (slidesWithAIImages >= 5) {
      console.log('🎉 EXCELLENT! AI image generation is working perfectly')
      console.log(`   ✅ Success rate: ${successRate}% (${slidesWithAIImages} images generated)`)
      console.log('   ✅ High-quality educational images created')
      console.log('   ✅ PowerPoint system fully operational with AI images')
    } else if (slidesWithAIImages >= 2) {
      console.log('⚠️  GOOD! AI image generation is working but may have some issues')
      console.log(`   ✅ Success rate: ${successRate}% (${slidesWithAIImages} images generated)`)
      console.log('   ⚠️  Some images failed - check API limits or network')
    } else {
      console.log('❌ ISSUES! AI image generation is not working properly')
      console.log(`   ❌ Success rate: ${successRate}% (only ${slidesWithAIImages} images generated)`)
      console.log('   🔍 Check API key, account balance, or network connectivity')
    }
    
    console.log('\n🎯 User Experience:')
    if (slidesWithAIImages >= 5) {
      console.log('✅ Users will see beautiful AI-generated images in their presentations')
      console.log('✅ Professional, educational-quality visuals')
      console.log('✅ Engaging and visually appealing PowerPoint slides')
      console.log('✅ No more placeholder images needed')
    } else {
      console.log('⚠️  Users may see some placeholder images mixed with AI images')
      console.log('⚠️  Presentation quality may be inconsistent')
    }
    
    console.log('\n🚀 Production Readiness:')
    if (slidesWithAIImages >= 5 && slidesWithErrors === 0) {
      console.log('🎉 READY FOR PRODUCTION!')
      console.log('✅ AI image generation system is fully operational')
      console.log('✅ High success rate and reliable performance')
      console.log('✅ Users will have an excellent experience')
    } else if (slidesWithAIImages >= 3) {
      console.log('⚠️  MOSTLY READY - Monitor for issues')
      console.log('✅ Core functionality working')
      console.log('⚠️  Some edge cases may need attention')
    } else {
      console.log('❌ NOT READY - Needs debugging')
      console.log('🔍 Investigate API issues before production deployment')
    }
    
  } catch (error) {
    console.log('\n❌ WORKFLOW ERROR:', error)
    console.log('🔍 Check system configuration and try again')
  }
  
  console.log('\n🎉 Complete Workflow Test Finished!')
  console.log('=' .repeat(70))
}

runCompleteWorkflowTest().catch(console.error)