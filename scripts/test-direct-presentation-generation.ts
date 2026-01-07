import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function testDirectPresentationGeneration() {
  console.log('🎯 Testing Direct AI Presentation Generation');
  console.log('='.repeat(60));

  try {
    // Test AI content generation directly
    console.log('\n📝 Testing AI Content Generation...');
    
    const presentationParams = {
      subject: 'Science',
      grade: 'Grade 5',
      topic: 'The Solar System',
      duration: 30,
      objectives: [
        'Students will identify the planets in our solar system',
        'Students will understand the order of planets from the sun',
        'Students will learn basic facts about each planet'
      ],
      difficulty: 'medium',
      slideCount: 6
    };

    console.log('📊 Generating presentation with params:');
    console.log(JSON.stringify(presentationParams, null, 2));

    // Generate AI content using OpenRouter directly
    const aiContent = await generateAIPresentation(presentationParams);
    
    console.log('\n✅ AI Content Generated Successfully!');
    console.log('📄 Content length:', aiContent.length, 'characters');
    
    // Parse the generated content
    console.log('\n🔍 Analyzing Generated Content Structure:');
    console.log('='.repeat(50));
    
    const slides = parseAIContent(aiContent);
    
    console.log(`📊 Total slides parsed: ${slides.length}`);
    
    slides.forEach((slide, index) => {
      console.log(`\n📋 Slide ${index + 1}:`);
      console.log(`   Title: ${slide.title}`);
      console.log(`   Content Lines: ${slide.content.split('\n').filter(line => line.trim()).length}`);
      console.log(`   Has Speaker Notes: ${slide.speakerNotes ? 'Yes' : 'No'}`);
      console.log(`   Has Image Prompt: ${slide.imagePrompt ? 'Yes' : 'No'}`);
      console.log(`   Layout: ${slide.layout || 'Not specified'}`);
      
      if (slide.content) {
        const preview = slide.content.replace(/\n/g, ' ').substring(0, 100);
        console.log(`   Content Preview: ${preview}...`);
      }
      
      if (slide.speakerNotes) {
        const notesPreview = slide.speakerNotes.replace(/\n/g, ' ').substring(0, 100);
        console.log(`   Speaker Notes Preview: ${notesPreview}...`);
      }
      
      if (slide.imagePrompt) {
        const promptPreview = slide.imagePrompt.substring(0, 100);
        console.log(`   Image Prompt Preview: ${promptPreview}...`);
      }
    });

    // Test image generation for the first slide with an image prompt
    const slideWithImage = slides.find(slide => slide.imagePrompt);
    if (slideWithImage) {
      console.log('\n🎨 Testing Image Generation...');
      console.log('='.repeat(40));
      
      console.log(`📝 Testing image for slide: "${slideWithImage.title}"`);
      console.log(`🖼️ Image prompt: ${slideWithImage.imagePrompt}`);
      
      try {
        const imageUrl = await generateImage(slideWithImage.imagePrompt, 'educational');
        if (imageUrl) {
          console.log('✅ Image generated successfully!');
          console.log(`🔗 Image URL: ${imageUrl.substring(0, 100)}...`);
        } else {
          console.log('❌ Image generation returned no URL');
        }
      } catch (imageError) {
        console.log(`❌ Image generation failed: ${imageError}`);
      }
    } else {
      console.log('\n⚠️ No slides with image prompts found for testing');
    }

    // Display the full content for review
    console.log('\n📄 Full Generated Content:');
    console.log('='.repeat(60));
    console.log(aiContent);
    console.log('='.repeat(60));

    console.log('\n🎉 Direct Generation Test Complete!');
    
    // Summary
    console.log('\n📊 Test Results Summary:');
    console.log(`✅ AI Content Generation: ${aiContent.length > 0 ? 'Working' : 'Failed'}`);
    console.log(`✅ Slide Parsing: ${slides.length > 0 ? 'Working' : 'Failed'}`);
    console.log(`✅ Image Prompts: ${slides.some(s => s.imagePrompt) ? 'Working' : 'Failed'}`);
    console.log(`✅ Speaker Notes: ${slides.some(s => s.speakerNotes) ? 'Working' : 'Failed'}`);
    console.log(`✅ Content Quality: ${slides.every(s => s.title && s.content) ? 'Good' : 'Needs Review'}`);
    
    return { slides, aiContent };

  } catch (error) {
    console.error('❌ Test failed:', error);
    throw error;
  }
}

// AI Content Generation Function (copied from the API)
async function generateAIPresentation(params: {
  subject: string
  grade: string
  topic: string
  duration: number
  objectives: string[]
  difficulty: string
  slideCount: number
}): Promise<string> {
  try {
    const { subject, grade, topic, duration, objectives, difficulty, slideCount } = params

    const prompt = `Create a comprehensive educational presentation about "${topic}" for ${grade} ${subject} students.

Requirements:
- Duration: ${duration} minutes
- Number of slides: ${slideCount}
- Difficulty level: ${difficulty}
- Learning objectives: ${objectives.join(', ')}

CRITICAL: Each slide MUST include specific, detailed visual suggestions for AI image generation.

Please generate a detailed presentation with the following EXACT structure for each slide:

# Slide [number]: [Title]
**Content:**
[Detailed bullet points or paragraphs explaining the concept - make it engaging and age-appropriate]

**Speaker Notes:**
[Detailed notes for the teacher including explanations, examples, and teaching tips]

**Image Prompt:**
[REQUIRED: Specific, detailed prompt for AI image generation that will create an educational illustration for this slide. Be very specific about what should be shown, the style should be educational and appropriate for ${grade} students]

**Layout:**
[Choose: title, content, image, or split - this determines how the image will be positioned]

---

Make sure to:
1. Start with an engaging title slide with a welcoming image
2. Include clear learning objectives slide with educational icons
3. Break down complex concepts into digestible parts with supporting visuals
4. Provide practical examples relevant to ${grade} students with real-world images
5. Include interactive elements or questions with engaging illustrations
6. End with a summary slide that reinforces key concepts with a comprehensive visual
7. Make content age-appropriate for ${grade} level
8. EVERY slide must have a detailed "Image Prompt" for AI image generation
9. Choose appropriate "Layout" for each slide (title, content, image, split)
10. Make image prompts specific, educational, and appropriate for the grade level

Generate exactly ${slideCount} slides with this format. Each slide MUST have an Image Prompt and Layout specified.`

    console.log('🤖 Calling OpenRouter AI...');
    
    // Use OpenRouter AI to generate the content
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'X-Title': 'ElimuNova AI Presentation Generator'
      },
      body: JSON.stringify({
        model: 'anthropic/claude-3.5-sonnet',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 4000,
        temperature: 0.7
      })
    })

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenRouter API error: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    const generatedContent = data.choices[0]?.message?.content

    if (!generatedContent) {
      throw new Error('No content generated from AI')
    }

    console.log('✅ AI content generated successfully')
    return generatedContent

  } catch (error) {
    console.error('❌ AI generation error:', error)
    throw error
  }
}

// Parse AI content into structured slides
function parseAIContent(content: string) {
  const slides = [];
  const slideBlocks = content.split('---').filter(block => block.trim());
  
  for (const block of slideBlocks) {
    const lines = block.trim().split('\n');
    let slide: any = {};
    let currentSection = '';
    let currentContent = '';
    
    for (const line of lines) {
      if (line.startsWith('# Slide')) {
        slide.title = line.replace(/^# Slide \d+:\s*/, '').trim();
      } else if (line.startsWith('**Content:**')) {
        if (currentSection && currentContent) {
          slide[currentSection] = currentContent.trim();
        }
        currentSection = 'content';
        currentContent = '';
      } else if (line.startsWith('**Speaker Notes:**')) {
        if (currentSection && currentContent) {
          slide[currentSection] = currentContent.trim();
        }
        currentSection = 'speakerNotes';
        currentContent = '';
      } else if (line.startsWith('**Image Prompt:**')) {
        if (currentSection && currentContent) {
          slide[currentSection] = currentContent.trim();
        }
        currentSection = 'imagePrompt';
        currentContent = '';
      } else if (line.startsWith('**Layout:**')) {
        if (currentSection && currentContent) {
          slide[currentSection] = currentContent.trim();
        }
        currentSection = 'layout';
        currentContent = '';
      } else if (currentSection && line.trim()) {
        currentContent += line + '\n';
      }
    }
    
    // Add the last section
    if (currentSection && currentContent) {
      slide[currentSection] = currentContent.trim();
    }
    
    if (slide.title) {
      slides.push(slide);
    }
  }
  
  return slides;
}

// Test image generation
async function generateImage(prompt: string, style: string = 'educational'): Promise<string | null> {
  try {
    console.log('🎨 Attempting image generation...');
    
    // Try DALL-E 3 first
    if (process.env.OPENAI_API_KEY) {
      console.log('🔄 Trying DALL-E 3...');
      
      const response = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
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
          console.log('✅ DALL-E 3 image generated');
          return imageUrl;
        }
      } else {
        console.log(`❌ DALL-E 3 failed: ${response.status}`);
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
          console.log('✅ Stability AI image generated');
          return `data:image/png;base64,${data.artifacts[0].base64}`;
        }
      } else {
        console.log(`❌ Stability AI failed: ${response.status}`);
      }
    }

    console.log('❌ No image APIs available or all failed');
    return null;

  } catch (error) {
    console.error('❌ Image generation error:', error);
    return null;
  }
}

// Run the test
if (require.main === module) {
  testDirectPresentationGeneration()
    .then(() => {
      console.log('\n🎯 Direct generation test completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Test failed:', error);
      process.exit(1);
    });
}

export { testDirectPresentationGeneration };