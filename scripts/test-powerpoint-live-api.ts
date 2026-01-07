/**
 * Live PowerPoint API Test
 * 
 * This script makes actual HTTP requests to test the PowerPoint APIs
 * in a real environment to verify end-to-end functionality.
 */

const BASE_URL = 'http://localhost:3000'

interface TestResult {
  success: boolean
  message: string
  data?: any
  error?: string
}

const testPowerPointData = {
  title: "Test AI Presentation - Photosynthesis",
  description: "AI-generated test presentation",
  subject: "Biology",
  grade: "Grade 9",
  topic: "Photosynthesis Process",
  duration: 30,
  slideCount: 5,
  slides: [
    {
      id: '1',
      title: 'Introduction to Photosynthesis',
      content: 'Photosynthesis is the process by which plants make food using sunlight.',
      slideType: 'title',
      speakerNotes: 'Welcome to our lesson on photosynthesis.',
      visualSuggestions: ['Plant image', 'Sun illustration'],
      order: 1
    },
    {
      id: '2',
      title: 'What Plants Need',
      content: '• Sunlight\n• Carbon dioxide\n• Water\n• Chlorophyll',
      slideType: 'content',
      speakerNotes: 'These are the four main ingredients for photosynthesis.',
      visualSuggestions: ['Ingredient diagram'],
      order: 2
    },
    {
      id: '3',
      title: 'The Process',
      content: 'Plants use sunlight to convert CO₂ and H₂O into glucose and oxygen.',
      slideType: 'content',
      speakerNotes: 'This is the basic chemical reaction.',
      visualSuggestions: ['Process diagram'],
      order: 3
    },
    {
      id: '4',
      title: 'Why It Matters',
      content: '• Produces oxygen we breathe\n• Creates food for plants\n• Removes CO₂ from air',
      slideType: 'content',
      speakerNotes: 'Explain the importance to life on Earth.',
      visualSuggestions: ['Earth ecosystem'],
      order: 4
    },
    {
      id: '5',
      title: 'Summary',
      content: 'Photosynthesis is essential for life on Earth!',
      slideType: 'summary',
      speakerNotes: 'Wrap up the lesson and check understanding.',
      visualSuggestions: ['Summary graphic'],
      order: 5
    }
  ],
  metadata: {
    objectives: [
      "Understand what photosynthesis is",
      "Know what plants need for photosynthesis",
      "Explain why photosynthesis is important"
    ],
    difficulty: "easy",
    format: "standard",
    generatedAt: new Date().toISOString()
  }
}

async function makeRequest(url: string, options: RequestInit = {}): Promise<TestResult> {
  try {
    console.log(`🌐 Making request to: ${url}`)
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    })

    const data = await response.json()

    if (response.ok) {
      return {
        success: true,
        message: `Request successful (${response.status})`,
        data
      }
    } else {
      return {
        success: false,
        message: `Request failed (${response.status})`,
        error: data.error || 'Unknown error'
      }
    }

  } catch (error) {
    return {
      success: false,
      message: 'Request failed with exception',
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

async function testPowerPointStorage(): Promise<TestResult> {
  console.log('\n💾 Testing PowerPoint Storage API...')
  
  const result = await makeRequest(`${BASE_URL}/api/powerpoint`, {
    method: 'POST',
    body: JSON.stringify(testPowerPointData)
  })

  if (result.success) {
    console.log('✅ PowerPoint saved successfully!')
    console.log(`📝 PowerPoint ID: ${result.data?.powerpoint?.id}`)
    console.log(`📚 Title: ${result.data?.powerpoint?.title}`)
  } else {
    console.log('❌ PowerPoint storage failed!')
    console.log(`Error: ${result.error}`)
  }

  return result
}

async function testPowerPointRetrieval(): Promise<TestResult> {
  console.log('\n📖 Testing PowerPoint Retrieval API...')
  
  const result = await makeRequest(`${BASE_URL}/api/powerpoint`)

  if (result.success) {
    const powerpoints = result.data?.powerpoints || []
    console.log(`✅ Retrieved ${powerpoints.length} PowerPoint presentations`)
    
    powerpoints.forEach((ppt: any, index: number) => {
      console.log(`\n📋 PowerPoint ${index + 1}:`)
      console.log(`   ID: ${ppt.id}`)
      console.log(`   Title: ${ppt.title}`)
      console.log(`   Subject: ${ppt.subject}`)
      console.log(`   Grade: ${ppt.grade}`)
      console.log(`   Slides: ${ppt.content?.slideCount || ppt.content?.slides?.length || 0}`)
    })
  } else {
    console.log('❌ PowerPoint retrieval failed!')
    console.log(`Error: ${result.error}`)
  }

  return result
}

async function testAIGeneration(): Promise<TestResult> {
  console.log('\n🧠 Testing AI Presentation Generation...')
  
  // Test the AI generation endpoint with a simple request
  const aiPayload = {
    title: "Test AI Generation",
    content: "Generate a presentation about photosynthesis for grade 9 biology students. Include 5 slides covering: introduction, what plants need, the process, importance, and summary.",
    generateImages: false,
    theme: "education"
  }

  const result = await makeRequest(`${BASE_URL}/api/ai/generate-presentation`, {
    method: 'POST',
    body: JSON.stringify(aiPayload)
  })

  if (result.success) {
    console.log('✅ AI generation endpoint is working!')
    console.log('📄 Generated presentation file')
  } else {
    console.log('❌ AI generation failed!')
    console.log(`Error: ${result.error}`)
  }

  return result
}

async function testExportFunctionality(powerpointId?: string): Promise<TestResult> {
  console.log('\n📤 Testing Export Functionality...')
  
  const exportPayload = {
    title: testPowerPointData.title,
    content: {
      slides: testPowerPointData.slides,
      duration: testPowerPointData.duration,
      slideCount: testPowerPointData.slideCount
    },
    format: 'pptx'
  }

  const result = await makeRequest(`${BASE_URL}/api/export/powerpoint`, {
    method: 'POST',
    body: JSON.stringify(exportPayload)
  })

  if (result.success) {
    console.log('✅ Export functionality is working!')
    console.log('📄 Generated PPTX file')
  } else {
    console.log('❌ Export failed!')
    console.log(`Error: ${result.error}`)
  }

  return result
}

async function testHealthCheck(): Promise<TestResult> {
  console.log('\n🏥 Testing API Health...')
  
  const result = await makeRequest(`${BASE_URL}/api/health`)

  if (result.success) {
    console.log('✅ API is healthy and responding!')
  } else {
    console.log('❌ API health check failed!')
    console.log(`Error: ${result.error}`)
  }

  return result
}

async function runLiveAPITests() {
  console.log('🚀 Starting Live PowerPoint API Tests')
  console.log(`🌐 Testing against: ${BASE_URL}`)
  console.log('=' .repeat(60))

  const results: { [key: string]: TestResult } = {}

  try {
    // Test 1: Health Check
    results.health = await testHealthCheck()

    // Test 2: PowerPoint Storage
    results.storage = await testPowerPointStorage()

    // Test 3: PowerPoint Retrieval
    results.retrieval = await testPowerPointRetrieval()

    // Test 4: AI Generation
    results.aiGeneration = await testAIGeneration()

    // Test 5: Export Functionality
    results.export = await testExportFunctionality()

    // Summary
    console.log('\n📊 TEST RESULTS SUMMARY')
    console.log('=' .repeat(60))

    const testNames = {
      health: 'API Health Check',
      storage: 'PowerPoint Storage',
      retrieval: 'PowerPoint Retrieval', 
      aiGeneration: 'AI Generation',
      export: 'Export Functionality'
    }

    let passedTests = 0
    let totalTests = 0

    Object.entries(results).forEach(([key, result]) => {
      totalTests++
      const status = result.success ? '✅ PASS' : '❌ FAIL'
      const testName = testNames[key as keyof typeof testNames] || key
      console.log(`${status} ${testName}`)
      
      if (result.success) {
        passedTests++
      } else {
        console.log(`     Error: ${result.error}`)
      }
    })

    console.log('\n' + '=' .repeat(60))
    console.log(`📈 Overall Results: ${passedTests}/${totalTests} tests passed`)
    
    if (passedTests === totalTests) {
      console.log('🎉 ALL TESTS PASSED! PowerPoint functionality is working correctly.')
    } else {
      console.log('⚠️  Some tests failed. Check the errors above for details.')
    }

    // Specific functionality status
    console.log('\n🎯 Functionality Status:')
    console.log(`   AI Generation: ${results.aiGeneration?.success ? '✅ Working' : '❌ Not Working'}`)
    console.log(`   Storage System: ${results.storage?.success ? '✅ Working' : '❌ Not Working'}`)
    console.log(`   Retrieval System: ${results.retrieval?.success ? '✅ Working' : '❌ Not Working'}`)
    console.log(`   Export System: ${results.export?.success ? '✅ Working' : '❌ Not Working'}`)

  } catch (error) {
    console.error('\n💥 LIVE API TESTS FAILED!')
    console.error('Error:', error)
  }
}

// Instructions for running the test
console.log('📋 PowerPoint Live API Test Instructions:')
console.log('1. Make sure your development server is running on localhost:3000')
console.log('2. Ensure you are logged in as a teacher')
console.log('3. Run this script to test the live APIs')
console.log('')

// Run the tests
if (require.main === module) {
  runLiveAPITests()
}

export { runLiveAPITests }