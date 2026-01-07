import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function testImageGenerationFixed() {
  console.log('🎨 Testing Image Generation with Correct API Keys');
  console.log('='.repeat(60));

  // Test prompts from our presentation system
  const testPrompts = [
    {
      title: "Solar System Overview",
      prompt: "Colorful illustration of the solar system showing the Sun in the center with all eight planets orbiting around it, with their names labeled, cartoon style, bright colors, educational diagram suitable for grade 5 students, space background with stars"
    },
    {
      title: "Photosynthesis Process", 
      prompt: "Educational diagram showing a green plant with labeled arrows pointing to sunlight from above, water being absorbed by roots from soil, and carbon dioxide entering through leaves, with oxygen bubbles coming out of leaves, cartoon style, bright colors, suitable for grade school students"
    },
    {
      title: "Learning Objectives",
      prompt: "Educational infographic showing learning objectives with space-themed icons: telescope for identifying planets, numbered list for planet order, lightbulb for facts, and magnifying glass for understanding differences, colorful and engaging for elementary students"
    }
  ];

  console.log('\n🔧 Available API Keys:');
  console.log(`✅ OpenAI DALL-E: ${process.env.OPENAI_DALLE_API_KEY ? 'Available' : 'Missing'}`);
  console.log(`✅ Stability AI: ${process.env.STABILITY_API_KEY ? 'Available' : 'Missing'}`);
  console.log(`✅ OpenRouter: ${process.env.OPENROUTER_API_KEY ? 'Available' : 'Missing'}`);

  for (const test of testPrompts) {
    console.log(`\n🖼️ Testing: ${test.title}`);
    console.log('='.repeat(40));
    console.log(`📝 Prompt: ${test.prompt.substring(0, 100)}...`);
    
    try {
      const imageUrl = await generateImageWithCorrectKeys(test.prompt);
      if (imageUrl) {
        console.log('✅ Image generated successfully!');
        console.log(`🔗 URL Type: ${imageUrl.startsWith('data:') ? 'Base64 Data' : 'HTTP URL'}`);
        console.log(`📏 URL Length: ${imageUrl.length} characters`);
        
        // Test if it's a valid URL or base64
        if (imageUrl.startsWith('http')) {
          console.log('🌐 HTTP URL - Can be embedded directly');
        } else if (imageUrl.startsWith('data:image')) {
          console.log('📊 Base64 Data URL - Ready for embedding');
        }
      } else {
        console.log('❌ No image generated');
      }
    } catch (error) {
      console.log(`❌ Error: ${error}`);
    }
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // Test the image generation function that the presentation system uses
  console.log('\n🔧 Testing Presentation System Image Function');
  console.log('='.repeat(50));
  
  try {
    const presentationImageUrl = await testPresentationImageGeneration(testPrompts[0].prompt);
    if (presentationImageUrl) {
      console.log('✅ Presentation system image generation working!');
      console.log(`🔗 Generated URL: ${presentationImageUrl.substring(0, 100)}...`);
    } else {
      console.log('❌ Presentation system image generation failed');
    }
  } catch (error) {
    console.log(`❌ Presentation system error: ${error}`);
  }

  console.log('\n🎉 Image Generation Test Complete!');
}

async function generateImageWithCorrectKeys(prompt: string): Promise<string | null> {
  try {
    // Try DALL-E 3 with the correct API key
    if (process.env.OPENAI_DALLE_API_KEY) {
      console.log('🔄 Trying DALL-E 3 with correct key...');
      
      const response = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_DALLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'dall-e-3',
          prompt: `${prompt}, educational style, suitable for children, bright colors, clear and simple`,
          n: 1,
          size: '1024x1024',
          quality: 'standard',
          style: 'natural'
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const imageUrl = data.data[0]?.url;
        if (imageUrl) {
          console.log('✅ DALL-E 3 success');
          return imageUrl;
        }
      } else {
        const errorText = await response.text();
        console.log(`❌ DALL-E 3 failed: ${response.status} - ${errorText.substring(0, 200)}`);
      }
    }

    // Try Stability AI as fallback
    if (process.env.STABILITY_API_KEY) {
      console.log('🔄 Trying Stability AI...');
      
      const response = await fetch('https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.STABILITY_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text_prompts: [
            {
              text: `${prompt}, educational illustration, cartoon style, bright colors, child-friendly`,
              weight: 1
            }
          ],
          cfg_scale: 7,
          height: 1024,
          width: 1024,
          samples: 1,
          steps: 30,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.artifacts && data.artifacts[0]) {
          console.log('✅ Stability AI success');
          return `data:image/png;base64,${data.artifacts[0].base64}`;
        }
      } else {
        const errorText = await response.text();
        console.log(`❌ Stability AI failed: ${response.status} - ${errorText.substring(0, 200)}`);
      }
    }

    console.log('❌ All image generation methods failed');
    return null;

  } catch (error) {
    console.error('❌ Image generation error:', error);
    return null;
  }
}

// Test the actual function used by the presentation system
async function testPresentationImageGeneration(prompt: string): Promise<string | null> {
  // This simulates the image generation logic from the presentation system
  try {
    const enhancedPrompt = `${prompt}, educational style, suitable for children, bright colors, clear and simple, cartoon illustration, high quality`;
    
    // Try the same logic as the presentation system
    if (process.env.OPENAI_DALLE_API_KEY) {
      const response = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_DALLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'dall-e-3',
          prompt: enhancedPrompt,
          n: 1,
          size: '1024x1024',
          quality: 'standard',
          style: 'natural'
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return data.data[0]?.url || null;
      }
    }

    return null;
  } catch (error) {
    console.error('Presentation image generation error:', error);
    return null;
  }
}

// Run the test
if (require.main === module) {
  testImageGenerationFixed()
    .then(() => {
      console.log('\n🎯 Image generation test completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Test failed:', error);
      process.exit(1);
    });
}

export { testImageGenerationFixed };