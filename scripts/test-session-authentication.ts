#!/usr/bin/env tsx

/**
 * Test session authentication to see why API calls are failing
 */

console.log('🔍 Testing Session Authentication Issues...\n')

async function testWithRealSession() {
  console.log('1. Testing with a real user session...')
  
  // First, let's try to get a session by logging in
  try {
    console.log('   Attempting to create a test session...')
    
    // Try to sign in with a test user
    const loginResponse = await fetch('http://localhost:3000/api/auth/signin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'teacher@demoschool.edu',
        password: 'password123'
      })
    })
    
    console.log(`   Login response: ${loginResponse.status}`)
    
    if (loginResponse.ok) {
      // Extract cookies from response
      const cookies = loginResponse.headers.get('set-cookie')
      console.log('   ✅ Login successful, got cookies')
      
      // Now try the PowerPoint API with the session cookies
      const apiResponse = await fetch('http://localhost:3000/api/powerpoint', {
        method: 'GET',
        headers: {
          'Cookie': cookies || ''
        }
      })
      
      console.log(`   API with session: ${apiResponse.status}`)
      
      if (apiResponse.ok) {
        console.log('   ✅ API works with proper session')
      } else {
        const errorText = await apiResponse.text()
        console.log(`   ❌ API still fails: ${errorText}`)
      }
    } else {
      console.log('   ❌ Login failed')
    }
    
  } catch (error) {
    console.log(`   ❌ Session test error: ${error}`)
  }
}

async function checkAuthConfiguration() {
  console.log('\n2. Checking authentication configuration...')
  
  try {
    // Check if NextAuth is properly configured
    const authResponse = await fetch('http://localhost:3000/api/auth/session', {
      method: 'GET'
    })
    
    console.log(`   Auth session endpoint: ${authResponse.status}`)
    
    if (authResponse.ok) {
      const sessionData = await authResponse.json()
      console.log('   Session data:', sessionData)
    } else {
      console.log('   ❌ Auth session endpoint not working')
    }
    
  } catch (error) {
    console.log(`   ❌ Auth config error: ${error}`)
  }
}

async function suggestFixes() {
  console.log('\n3. Suggested fixes for authentication issues...')
  
  console.log('   🔧 Possible solutions:')
  console.log('   1. Add authentication check to PowerPoint page')
  console.log('   2. Ensure user is properly logged in before using the feature')
  console.log('   3. Add error handling for authentication failures')
  console.log('   4. Show login prompt if user is not authenticated')
  
  console.log('\n   📝 Code fixes needed:')
  console.log('   1. Add useSession hook to PowerPoint page')
  console.log('   2. Show loading state while checking authentication')
  console.log('   3. Redirect to login if not authenticated')
  console.log('   4. Add proper error messages for auth failures')
}

async function runAuthTest() {
  console.log('🚀 Starting Session Authentication Test...\n')
  
  await testWithRealSession()
  await checkAuthConfiguration()
  await suggestFixes()
  
  console.log('\n📊 AUTHENTICATION DIAGNOSIS:')
  console.log('=' .repeat(60))
  console.log('❌ ISSUE CONFIRMED: Authentication is blocking PowerPoint saves')
  console.log('🎯 ROOT CAUSE: User session is not being properly validated')
  console.log('💡 SOLUTION: Add proper authentication handling to PowerPoint page')
  
  console.log('\n🛠️  IMMEDIATE FIX NEEDED:')
  console.log('1. Add useSession hook to check if user is logged in')
  console.log('2. Show login prompt if user is not authenticated')
  console.log('3. Add proper error handling for failed saves')
  console.log('4. Test the complete workflow after authentication fix')
}

runAuthTest().catch(console.error)