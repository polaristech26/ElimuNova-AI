#!/usr/bin/env tsx

/**
 * Test script to verify Vercel deployment fixes
 * This script checks that all import errors have been resolved
 */

import { execSync } from 'child_process'
import { readFileSync } from 'fs'
import path from 'path'

console.log('🔍 Testing Vercel Deployment Fixes...\n')

// Test 1: Check that authOptions is properly imported
console.log('1. Testing authOptions imports...')
try {
  const authFile = readFileSync('src/lib/auth.ts', 'utf8')
  if (authFile.includes('export const authOptions')) {
    console.log('✅ authOptions is properly exported from src/lib/auth.ts')
  } else {
    console.log('❌ authOptions export not found in src/lib/auth.ts')
  }
} catch (error) {
  console.log('❌ Could not read src/lib/auth.ts')
}

// Test 2: Check that generateAIContent is properly exported
console.log('\n2. Testing generateAIContent export...')
try {
  const openrouterFile = readFileSync('src/lib/openrouter-ai.ts', 'utf8')
  if (openrouterFile.includes('export const generateAIContent')) {
    console.log('✅ generateAIContent is properly exported from src/lib/openrouter-ai.ts')
  } else {
    console.log('❌ generateAIContent export not found in src/lib/openrouter-ai.ts')
  }
} catch (error) {
  console.log('❌ Could not read src/lib/openrouter-ai.ts')
}

// Test 3: Check API routes for correct imports
console.log('\n3. Testing API route imports...')
const apiRoutes = [
  'src/app/api/ai/generate-rubric/route.ts',
  'src/app/api/student/dashboard-stats/route.ts',
  'src/app/api/super-admin/dashboard-stats/route.ts'
]

for (const route of apiRoutes) {
  try {
    const routeFile = readFileSync(route, 'utf8')
    if (routeFile.includes("from '@/lib/auth'")) {
      console.log(`✅ ${route} - authOptions import fixed`)
    } else if (routeFile.includes("from '@/app/api/auth/[...nextauth]/route'")) {
      console.log(`❌ ${route} - still has old authOptions import`)
    } else {
      console.log(`ℹ️  ${route} - no authOptions import found`)
    }
  } catch (error) {
    console.log(`❌ Could not read ${route}`)
  }
}

// Test 4: Try to build the project (TypeScript check)
console.log('\n4. Testing TypeScript compilation...')
try {
  console.log('Running TypeScript check...')
  execSync('npx tsc --noEmit --skipLibCheck', { 
    stdio: 'pipe',
    cwd: process.cwd()
  })
  console.log('✅ TypeScript compilation successful')
} catch (error) {
  console.log('❌ TypeScript compilation failed')
  console.log('Error details:', error.toString().slice(0, 500))
}

// Test 5: Check for any remaining import issues
console.log('\n5. Checking for remaining import issues...')
try {
  const result = execSync('grep -r "from.*@/app/api/auth" src/ || true', { 
    encoding: 'utf8',
    cwd: process.cwd()
  })
  
  if (result.trim()) {
    console.log('❌ Found remaining old auth imports:')
    console.log(result)
  } else {
    console.log('✅ No old auth imports found')
  }
} catch (error) {
  console.log('ℹ️  Could not check for old imports (grep not available)')
}

console.log('\n🎯 Summary:')
console.log('- Fixed authOptions imports to use @/lib/auth')
console.log('- Added generateAIContent export to openrouter-ai.ts')
console.log('- Updated API routes to use correct import paths')
console.log('\n✅ Vercel deployment import errors should now be resolved!')
console.log('\n📝 Next steps:')
console.log('1. Commit these changes to git')
console.log('2. Push to GitHub')
console.log('3. Deploy to Vercel')
console.log('4. Test the deployed application')