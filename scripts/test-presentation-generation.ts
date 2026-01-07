import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const prisma = new PrismaClient();

async function testPresentationGeneration() {
  console.log('🎯 Testing Presentation Generation System');
  console.log('='.repeat(60));

  try {
    // Test presentation generation API
    console.log('\n📝 Testing AI Presentation Generation...');
    
    const presentationData = {
      topic: 'The Solar System',
      gradeLevel: 'Grade 5',
      duration: '30 minutes',
      learningObjectives: [
        'Students will identify the planets in our solar system',
        'Students will understand the order of planets from the sun',
        'Students will learn basic facts about each planet'
      ],
      additionalRequirements: 'Include fun facts and interactive elements'
    };

    console.log('📊 Generating presentation with data:');
    console.log(JSON.stringify(presentationData, null, 2));

    // Make API call to generate presentation
    const response = await fetch('http://localhost:3000/api/ai/generate-presentation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(presentationData)
    });

    if (!response.ok) {
      throw new Error(`API call failed: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    console.log('\n✅ Presentation generated successfully!');
    
    // Analyze the generated content
    console.log('\n🔍 Analyzing Generated Content:');
    console.log('='.repeat(40));
    
    if (result.slides && Array.isArray(result.slides)) {
      console.log(`📊 Total slides generated: ${result.slides.length}`);
      
      result.slides.forEach((slide: any, index: number) => {
        console.log(`\n📋 Slide ${index + 1}:`);
        console.log(`   Title: ${slide.title || 'No title'}`);
        console.log(`   Type: ${slide.type || 'Unknown'}`);
        console.log(`   Content Lines: ${slide.content ? slide.content.split('\n').length : 0}`);
        console.log(`   Has Speaker Notes: ${slide.speakerNotes ? 'Yes' : 'No'}`);
        console.log(`   Has Image Prompt: ${slide.imagePrompt ? 'Yes' : 'No'}`);
        
        if (slide.content) {
          console.log(`   Content Preview: ${slide.content.substring(0, 100)}...`);
        }
        
        if (slide.speakerNotes) {
          console.log(`   Speaker Notes Preview: ${slide.speakerNotes.substring(0, 100)}...`);
        }
        
        if (slide.imagePrompt) {
          console.log(`   Image Prompt: ${slide.imagePrompt.substring(0, 100)}...`);
        }
      });
    } else {
      console.log('❌ No slides found in response');
    }

    // Test image generation for first slide
    if (result.slides && result.slides.length > 0 && result.slides[0].imagePrompt) {
      console.log('\n🎨 Testing Image Generation...');
      console.log('='.repeat(40));
      
      const imagePrompt = result.slides[0].imagePrompt;
      console.log(`📝 Testing image generation for prompt: ${imagePrompt}`);
      
      try {
        const imageResponse = await fetch('http://localhost:3000/api/ai/generate-image', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            prompt: imagePrompt,
            style: 'educational'
          })
        });

        if (imageResponse.ok) {
          const imageResult = await imageResponse.json();
          console.log('✅ Image generation API responded successfully');
          console.log(`📸 Image URL generated: ${imageResult.imageUrl ? 'Yes' : 'No'}`);
          
          if (imageResult.imageUrl) {
            console.log(`🔗 Image URL: ${imageResult.imageUrl.substring(0, 100)}...`);
          }
        } else {
          console.log(`❌ Image generation failed: ${imageResponse.status}`);
        }
      } catch (imageError) {
        console.log(`❌ Image generation error: ${imageError}`);
      }
    }

    // Test saving to database
    console.log('\n💾 Testing Database Storage...');
    console.log('='.repeat(40));
    
    try {
      const savedPresentation = await prisma.aiContent.create({
        data: {
          type: 'PRESENTATION',
          title: `Test: ${presentationData.topic}`,
          content: JSON.stringify(result),
          metadata: JSON.stringify({
            gradeLevel: presentationData.gradeLevel,
            duration: presentationData.duration,
            slideCount: result.slides?.length || 0
          }),
          userId: 'test-user-id',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });
      
      console.log('✅ Presentation saved to database successfully');
      console.log(`📝 Database ID: ${savedPresentation.id}`);
      
      // Clean up test data
      await prisma.aiContent.delete({
        where: { id: savedPresentation.id }
      });
      console.log('🧹 Test data cleaned up');
      
    } catch (dbError) {
      console.log(`❌ Database error: ${dbError}`);
    }

    // Test PowerPoint export
    console.log('\n📄 Testing PowerPoint Export...');
    console.log('='.repeat(40));
    
    try {
      const exportResponse = await fetch('http://localhost:3000/api/export/powerpoint', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          slides: result.slides,
          title: presentationData.topic
        })
      });

      if (exportResponse.ok) {
        console.log('✅ PowerPoint export API responded successfully');
        const contentType = exportResponse.headers.get('content-type');
        console.log(`📊 Response content type: ${contentType}`);
        
        if (contentType?.includes('application/vnd.openxmlformats-officedocument.presentationml.presentation')) {
          console.log('✅ Correct PPTX content type returned');
        }
      } else {
        console.log(`❌ PowerPoint export failed: ${exportResponse.status}`);
      }
    } catch (exportError) {
      console.log(`❌ PowerPoint export error: ${exportError}`);
    }

    console.log('\n🎉 Presentation Generation Test Complete!');
    console.log('='.repeat(60));
    
    // Summary
    console.log('\n📊 Test Results Summary:');
    console.log(`✅ AI Content Generation: ${result.slides ? 'Working' : 'Failed'}`);
    console.log(`✅ Slide Structure: ${result.slides?.length > 0 ? 'Working' : 'Failed'}`);
    console.log(`✅ Image Prompts: ${result.slides?.some((s: any) => s.imagePrompt) ? 'Working' : 'Failed'}`);
    console.log(`✅ Speaker Notes: ${result.slides?.some((s: any) => s.speakerNotes) ? 'Working' : 'Failed'}`);
    
    return result;

  } catch (error) {
    console.error('❌ Test failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
if (require.main === module) {
  testPresentationGeneration()
    .then(() => {
      console.log('\n🎯 All tests completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Test failed:', error);
      process.exit(1);
    });
}

export { testPresentationGeneration };