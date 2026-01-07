#!/usr/bin/env tsx

/**
 * Check what's actually in the database for PowerPoint presentations
 */

import { config } from 'dotenv'
import { PrismaClient } from '@prisma/client'

// Load environment variables
config()

const prisma = new PrismaClient()

console.log('🔍 Checking Database for PowerPoint Data...\n')

async function checkAllAIContent() {
  console.log('1. Checking all AI generated content...')
  
  try {
    const allContent = await prisma.aIGeneratedContent.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    console.log(`   Found ${allContent.length} AI generated content items`)
    
    if (allContent.length > 0) {
      console.log('\n   📋 All AI Content:')
      allContent.forEach((content, index) => {
        console.log(`   ${index + 1}. "${content.title}" (${content.type})`)
        console.log(`      - Subject: ${content.subject}`)
        console.log(`      - Grade: ${content.grade}`)
        console.log(`      - Created: ${content.createdAt}`)
        console.log(`      - Content length: ${content.content?.length || 0} characters`)
      })
      
      // Check specifically for PowerPoint content
      const powerpoints = allContent.filter(c => c.type === 'POWERPOINT')
      console.log(`\n   🎯 PowerPoint presentations: ${powerpoints.length}`)
      
      if (powerpoints.length > 0) {
        console.log('\n   📊 PowerPoint Details:')
        powerpoints.forEach((ppt, index) => {
          console.log(`   ${index + 1}. "${ppt.title}"`)
          
          try {
            const content = typeof ppt.content === 'string' ? JSON.parse(ppt.content) : ppt.content
            if (content && content.slides) {
              const slidesWithImages = content.slides.filter((slide: any) => slide.imageUrl).length
              console.log(`      - Slides: ${content.slides.length}`)
              console.log(`      - Slides with images: ${slidesWithImages}`)
              
              if (slidesWithImages > 0) {
                console.log(`      - ✅ HAS IMAGES IN DATABASE!`)
                content.slides.forEach((slide: any, slideIndex: number) => {
                  if (slide.imageUrl) {
                    const imageType = slide.imageUrl.startsWith('data:') ? 'Base64' : 'URL'
                    const imageSize = slide.imageUrl.startsWith('data:') ? 
                      Math.round((slide.imageUrl.split(',')[1]?.length || 0) * 3 / 4 / 1024) : 'Unknown'
                    console.log(`         Slide ${slideIndex + 1}: ${imageType} image (${imageSize}KB)`)
                  }
                })
              } else {
                console.log(`      - ❌ No images found in slides`)
              }
            } else {
              console.log(`      - ❌ No slides found in content`)
            }
          } catch (error) {
            console.log(`      - ❌ Error parsing content: ${error}`)
          }
        })
      }
    } else {
      console.log('   ℹ️  No AI generated content found in database')
    }
    
    return allContent
  } catch (error) {
    console.log(`   ❌ Database error: ${error}`)
    return []
  }
}

async function checkTeachers() {
  console.log('\n2. Checking teachers in database...')
  
  try {
    const teachers = await prisma.teacher.findMany({
      include: {
        user: true
      }
    })
    
    console.log(`   Found ${teachers.length} teachers`)
    
    if (teachers.length > 0) {
      teachers.forEach((teacher, index) => {
        console.log(`   ${index + 1}. ${teacher.user.firstName} ${teacher.user.lastName} (${teacher.user.email})`)
        console.log(`      - Teacher ID: ${teacher.id}`)
        console.log(`      - User ID: ${teacher.userId}`)
      })
    }
    
    return teachers
  } catch (error) {
    console.log(`   ❌ Error checking teachers: ${error}`)
    return []
  }
}

async function checkRecentActivity() {
  console.log('\n3. Checking recent database activity...')
  
  try {
    // Check recent AI content creation
    const recentContent = await prisma.aIGeneratedContent.findMany({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    console.log(`   Found ${recentContent.length} AI content items created in last 24 hours`)
    
    if (recentContent.length > 0) {
      recentContent.forEach((content, index) => {
        console.log(`   ${index + 1}. "${content.title}" (${content.type}) - ${content.createdAt}`)
      })
    }
    
    return recentContent
  } catch (error) {
    console.log(`   ❌ Error checking recent activity: ${error}`)
    return []
  }
}

async function testDatabaseConnection() {
  console.log('\n4. Testing database connection...')
  
  try {
    await prisma.$queryRaw`SELECT 1 as test`
    console.log('   ✅ Database connection successful')
    
    // Check if tables exist
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('ai_generated_content', 'teachers', 'users')
    ` as any[]
    
    console.log(`   ✅ Found ${tables.length} relevant tables:`)
    tables.forEach(table => {
      console.log(`      - ${table.table_name}`)
    })
    
    return true
  } catch (error) {
    console.log(`   ❌ Database connection error: ${error}`)
    return false
  }
}

async function runCheck() {
  console.log('🚀 Starting Database Check...\n')
  
  // Test database connection first
  const dbConnected = await testDatabaseConnection()
  
  if (!dbConnected) {
    console.log('\n❌ Cannot proceed - database connection failed')
    return
  }
  
  // Check all content
  const allContent = await checkAllAIContent()
  
  // Check teachers
  const teachers = await checkTeachers()
  
  // Check recent activity
  const recentContent = await checkRecentActivity()
  
  // Summary
  console.log('\n📊 SUMMARY:')
  console.log('=' .repeat(50))
  
  if (allContent.length === 0) {
    console.log('❌ NO POWERPOINT PRESENTATIONS FOUND')
    console.log('   This means either:')
    console.log('   1. No presentations have been created yet')
    console.log('   2. Presentations are not being saved to database')
    console.log('   3. There\'s an issue with the save workflow')
  } else {
    const powerpoints = allContent.filter(c => c.type === 'POWERPOINT')
    if (powerpoints.length > 0) {
      const withImages = powerpoints.filter(ppt => {
        try {
          const content = typeof ppt.content === 'string' ? JSON.parse(ppt.content) : ppt.content
          return content?.slides?.some((slide: any) => slide.imageUrl)
        } catch {
          return false
        }
      })
      
      console.log(`✅ Found ${powerpoints.length} PowerPoint presentations`)
      console.log(`🖼️  ${withImages.length} have images stored`)
      
      if (withImages.length === 0) {
        console.log('⚠️  Images are not being saved with presentations')
        console.log('   This suggests the issue is in the image generation workflow')
      } else {
        console.log('✅ Images ARE being saved to database')
        console.log('   The issue is likely in the frontend display')
      }
    }
  }
  
  if (teachers.length === 0) {
    console.log('❌ No teachers found - this might be a setup issue')
  } else {
    console.log(`✅ Found ${teachers.length} teachers in database`)
  }
  
  console.log('\n🎯 NEXT STEPS:')
  if (allContent.length === 0) {
    console.log('1. Try creating a PowerPoint presentation through the UI')
    console.log('2. Check if the save operation completes successfully')
    console.log('3. Run this script again to see if data appears')
  } else {
    console.log('1. Check the frontend image display logic')
    console.log('2. Look for JavaScript errors in browser console')
    console.log('3. Verify image URLs are being rendered correctly')
  }
  
  await prisma.$disconnect()
}

runCheck().catch(console.error)