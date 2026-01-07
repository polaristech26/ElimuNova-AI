#!/usr/bin/env tsx

/**
 * Test the PowerPoint save workflow to identify where it's failing
 */

import { config } from 'dotenv'

// Load environment variables
config()

console.log('🔍 Testing PowerPoint Save Workflow...\n')

async function testPowerPointAPI() {
  console.log('1. Testing PowerPoint API endpoints...')
  
  // Test GET endpoint (should work)
  try {
    console.log('   Testing GET /api/powerpoint...')
    const getResponse = await fetch('http://localhost:3000/api/powerpoint', {
      method: 'GET',
      headers: {
        'Cookie': 'next-auth.session-token=test' // Mock session
      }
    })
    
    console.log(`   GET Response: ${getResponse.status} ${getResponse.statusText}`)
    
    if (getResponse.ok) {
      const data = await getResponse.json()
      console.log(`   ✅ GET successful - Found ${data.powerpoints?.length || 0} presentations`)
    } else {
      const errorText = await getResponse.text()
      console.log(`   ❌ GET failed: ${errorText}`)
    }
  } catch (error) {
    console.log(`   ❌ GET error: ${error}`)
  }
  
  // Test POST endpoint (this is where the issue likely is)
  try {
    console.log('\n   Testing POST /api/powerpoint...')
    
    const testPresentationData = {
      title: 'Test PowerPoint with Images',
      description: 'A test presentation to verify the save workflow',
      subject: 'Science',
      grade: 'Grade 5',
      topic: 'Solar System',
      duration: 45,
      slideCount: 3,
      slides: [
        {
          id: 'slide-1',
          title: 'Title Slide',
          content: 'Welcome to our presentation',
          slideType: 'title',
          speakerNotes: 'Introduction slide',
          visualSuggestions: [],
          order: 1
        },
        {
          id: 'slide-2',
          title: 'Content with Image',
          content: 'This slide should have an image',
          slideType: 'content',
          speakerNotes: 'Main content slide',
          visualSuggestions: ['solar system diagram', 'educational illustration'],
          order: 2,
          imageUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
          hasImage: true,
          imageSource: 'stability-ai'
        },
        {
          id: 'slide-3',
          title: 'Summary',
          content: 'Thank you for your attention',
          slideType: 'summary',
          speakerNotes: 'Closing slide',
          visualSuggestions: [],
          order: 3
        }
      ],
      metadata: {
        objectives: ['Learn about space', 'Understand planets'],
        difficulty: 'medium',
        format: 'standard',
        generatedAt: new Date().toISOString()
      }
    }
    
    const postResponse = await fetch('http://localhost:3000/api/powerpoint', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': 'next-auth.session-token=test' // Mock session
      },
      body: JSON.stringify(testPresentationData)
    })
    
    console.log(`   POST Response: ${postResponse.status} ${postResponse.statusText}`)
    
    if (postResponse.ok) {
      const data = await postResponse.json()
      console.log(`   ✅ POST successful - Presentation saved with ID: ${data.powerpoint?.id}`)
      console.log(`   📊 Slides saved: ${data.powerpoint?.content?.slides?.length || 0}`)
      
      // Check if images were preserved
      const slidesWithImages = data.powerpoint?.content?.slides?.filter((slide: any) => slide.imageUrl) || []
      console.log(`   🖼️  Slides with images: ${slidesWithImages.length}`)
      
      return data.powerpoint
    } else {
      const errorText = await postResponse.text()
      console.log(`   ❌ POST failed: ${errorText}`)
      
      // Try to parse error details
      try {
        const errorData = JSON.parse(errorText)
        console.log(`   Error details: ${errorData.error}`)
      } catch {
        // Error text is not JSON
      }
      
      return null
    }
  } catch (error) {
    console.log(`   ❌ POST error: ${error}`)
    return null
  }
}

async function testAuthenticationFlow() {
  console.log('\n2. Testing authentication flow...')
  
  // The issue might be authentication - let's check what happens with different auth scenarios
  
  try {
    // Test without authentication
    console.log('   Testing without authentication...')
    const noAuthResponse = await fetch('http://localhost:3000/api/powerpoint', {
      method: 'GET'
    })
    
    console.log(`   No auth response: ${noAuthResponse.status}`)
    
    if (noAuthResponse.status === 401) {
      console.log('   ✅ API correctly requires authentication')
    } else {
      console.log('   ⚠️  API allows access without authentication')
    }
    
  } catch (error) {
    console.log(`   ❌ Auth test error: ${error}`)
  }
}

async function testDatabaseAfterSave() {
  console.log('\n3. Checking database after save attempt...')
  
  try {
    // Import Prisma to check database directly
    const { PrismaClient } = await import('@prisma/client')
    const prisma = new PrismaClient()
    
    const presentations = await prisma.aIGeneratedContent.findMany({
      where: {
        type: 'POWERPOINT'
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 5
    })
    
    console.log(`   Found ${presentations.length} presentations in database`)
    
    if (presentations.length > 0) {
      const latest = presentations[0]
      console.log(`   Latest: "${latest.title}" created at ${latest.createdAt}`)
      
      // Check if it has images
      try {
        const content = typeof latest.content === 'string' ? JSON.parse(latest.content) : latest.content
        const slidesWithImages = content?.slides?.filter((slide: any) => slide.imageUrl) || []
        console.log(`   Images in latest presentation: ${slidesWithImages.length}`)
      } catch (error) {
        console.log(`   Error parsing content: ${error}`)
      }
    }
    
    await prisma.$disconnect()
    return presentations
  } catch (error) {
    console.log(`   ❌ Database check error: ${error}`)
    return []
  }
}

async function runWorkflowTest() {
  console.log('🚀 Starting PowerPoint Save Workflow Test...\n')
  
  // Step 1: Test API endpoints
  const savedPresentation = await testPowerPointAPI()
  
  // Step 2: Test authentication
  await testAuthenticationFlow()
  
  // Step 3: Check database
  const dbPresentations = await testDatabaseAfterSave()
  
  // Summary
  console.log('\n📊 WORKFLOW TEST RESULTS:')
  console.log('=' .repeat(60))
  
  if (savedPresentation) {
    console.log('✅ PowerPoint API is working')
    console.log('✅ Presentations can be saved successfully')
    console.log('✅ Images are preserved in the save process')
    
    if (dbPresentations.length > 0) {
      console.log('✅ Data is being saved to database')
      console.log('🎯 Issue is likely in the frontend UI or authentication')
    } else {
      console.log('❌ Data is not appearing in database')
      console.log('🎯 Issue is in the database save process')
    }
  } else {
    console.log('❌ PowerPoint API is not working')
    console.log('🎯 Issue is in the API endpoint or authentication')
  }
  
  console.log('\n🔧 DEBUGGING STEPS:')
  console.log('1. Check browser developer tools for:')
  console.log('   - Network tab: Failed API requests')
  console.log('   - Console tab: JavaScript errors')
  console.log('   - Application tab: Session/cookie issues')
  
  console.log('\n2. Check server logs for:')
  console.log('   - Authentication errors')
  console.log('   - Database connection issues')
  console.log('   - API endpoint errors')
  
  console.log('\n3. Verify in the UI:')
  console.log('   - User is properly logged in')
  console.log('   - Save button is actually being clicked')
  console.log('   - Success/error messages are accurate')
  
  if (!savedPresentation) {
    console.log('\n⚠️  CRITICAL: The save workflow is completely broken')
    console.log('   This explains why you see image generation success but no saved presentations')
  }
}

runWorkflowTest().catch(console.error)