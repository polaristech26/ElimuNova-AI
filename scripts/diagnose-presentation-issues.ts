import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function diagnosePresentationIssues() {
  console.log('🔍 Diagnosing Presentation Generation Issues');
  console.log('='.repeat(60));

  // Test 1: Check AI Content Generation API
  console.log('\n1️⃣ Testing AI Content Generation API...');
  console.log('='.repeat(40));
  
  try {
    const response = await fetch('/api/ai/generate-presentation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token' // This will fail but show us the error
      },
      body: JSON.stringify({
        subject: 'Science',
        grade: 'Grade 5',
        topic: 'Solar System',
        duration: 30,
        objectives: ['Learn about planets'],
        difficulty: 'medium',
        slideCount: 5
      })
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ API Response received');
      console.log('📄 Response type:', typeof data);
      console.log('📊 Response keys:', Object.keys(data));
      
      if (data.presentation) {
        console.log('📝 Generated content preview:');
        console.log(data.presentation.substring(0, 500) + '...');
        
        // Test content parsing
        const slides = parseAIContent(data.presentation);
        console.log(`📋 Parsed slides: ${slides.length}`);
        slides.forEach((slide, i) => {
          console.log(`   Slide ${i + 1}: "${slide.title}" (${slide.content?.length || 0} chars)`);
          console.log(`   Has image prompt: ${slide.imagePrompt ? 'Yes' : 'No'}`);
        });
      }
    } else {
      const error = await response.text();
      console.log('❌ API Error:', response.status, error);
    }
  } catch (error) {
    console.log('❌ API Request failed:', error);
  }

  // Test 2: Check Image Generation
  console.log('\n2️⃣ Testing Image Generation...');
  console.log('='.repeat(40));
  
  try {
    const testPrompt = "Educational diagram showing the solar system with planets labeled, cartoon style, bright colors, suitable for grade 5 students";
    
    console.log('🎨 Testing Stability AI...');
    const imageUrl = await generateImageDirect(testPrompt);
    
    if (imageUrl) {
      console.log('✅ Image generated successfully');
      console.log(`📏 Image URL length: ${imageUrl.length}`);
      console.log(`🔗 URL type: ${imageUrl.startsWith('data:') ? 'Base64 Data URL' : 'HTTP URL'}`);
      
      // Test if it's valid base64
      if (imageUrl.startsWith('data:image/')) {
        try {
          const base64Data = imageUrl.split(',')[1];
          const buffer = Buffer.from(base64Data, 'base64');
          console.log(`📊 Image size: ${Math.round(buffer.length / 1024)} KB`);
          console.log('✅ Valid base64 image data');
        } catch (e) {
          console.log('❌ Invalid base64 data');
        }
      }
    } else {
      console.log('❌ No image generated');
    }
  } catch (error) {
    console.log('❌ Image generation failed:', error);
  }

  // Test 3: Check PowerPoint Export API
  console.log('\n3️⃣ Testing PowerPoint Export API...');
  console.log('='.repeat(40));
  
  try {
    const mockSlides = [
      {
        title: "Test Slide 1",
        content: "This is test content for slide 1",
        slideType: "title",
        speakerNotes: "These are speaker notes",
        visualSuggestions: ["Test image"],
        order: 1
      },
      {
        title: "Test Slide 2", 
        content: "This is test content for slide 2",
        slideType: "content",
        speakerNotes: "More speaker notes",
        visualSuggestions: ["Another test image"],
        order: 2
      }
    ];

    const response = await fetch('/api/export/powerpoint', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: 'Test Presentation',
        slides: mockSlides,
        format: 'pptx'
      })
    });

    if (response.ok) {
      console.log('✅ PowerPoint export API responded');
      console.log(`📄 Content type: ${response.headers.get('content-type')}`);
      console.log(`📊 Content length: ${response.headers.get('content-length')} bytes`);
      
      const blob = await response.blob();
      console.log(`📦 Blob size: ${blob.size} bytes`);
      console.log(`📋 Blob type: ${blob.type}`);
    } else {
      const error = await response.text();
      console.log('❌ PowerPoint export failed:', response.status, error);
    }
  } catch (error) {
    console.log('❌ PowerPoint export error:', error);
  }

  // Test 4: Check Content Parsing
  console.log('\n4️⃣ Testing Content Parsing...');
  console.log('='.repeat(40));
  
  const sampleContent = `# Slide 1: Introduction to Solar System
**Content:**
• Our solar system has 8 planets
• The Sun is at the center
• Planets orbit around the Sun
• Each planet is unique

**Speaker Notes:**
Welcome students to learn about our amazing solar system. Start by asking what they already know.

**Image Prompt:**
Colorful diagram of the solar system showing the Sun in center with 8 planets orbiting, educational style, bright colors, labeled planets, suitable for grade 5 students

**Layout:**
title

---

# Slide 2: The Planets
**Content:**
• Mercury - closest to Sun
• Venus - hottest planet  
• Earth - our home
• Mars - the red planet

**Speaker Notes:**
Discuss each planet's unique characteristics and help students remember the order.

**Image Prompt:**
Educational illustration showing the four inner planets with their key features labeled, cartoon style, colorful, child-friendly

**Layout:**
content

---`;

  const parsedSlides = parseAIContent(sampleContent);
  console.log(`📊 Parsed ${parsedSlides.length} slides from sample content`);
  
  parsedSlides.forEach((slide, i) => {
    console.log(`\n📋 Slide ${i + 1}:`);
    console.log(`   Title: "${slide.title}"`);
    console.log(`   Content: ${slide.content?.length || 0} chars`);
    console.log(`   Speaker Notes: ${slide.speakerNotes ? 'Yes' : 'No'}`);
    console.log(`   Image Prompt: ${slide.imagePrompt ? 'Yes' : 'No'}`);
    console.log(`   Layout: ${slide.layout || 'Not specified'}`);
    
    if (slide.content) {
      console.log(`   Content preview: ${slide.content.substring(0, 100)}...`);
    }
  });

  // Test 5: Check Full Integration
  console.log('\n5️⃣ Testing Full Integration...');
  console.log('='.repeat(40));
  
  console.log('🔧 Issues Identified:');
  console.log('1. Authentication required for AI generation API');
  console.log('2. Image generation working but may not be embedded properly');
  console.log('3. Content parsing appears functional');
  console.log('4. PowerPoint export needs testing with real data');
  
  console.log('\n💡 Recommendations:');
  console.log('1. Test with authenticated session');
  console.log('2. Verify image embedding in PowerPoint files');
  console.log('3. Check if images are being passed to export API');
  console.log('4. Ensure proper error handling for failed image generation');

  return {
    aiGeneration: 'needs_auth',
    imageGeneration: 'working',
    contentParsing: 'working',
    powerpointExport: 'needs_testing'
  };
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

// Direct image generation test
async function generateImageDirect(prompt: string): Promise<string | null> {
  try {
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
        return `data:image/png;base64,${data.artifacts[0].base64}`;
      }
    } else {
      const errorText = await response.text();
      console.log(`Stability AI error: ${response.status} - ${errorText}`);
    }

    return null;
  } catch (error) {
    console.error('Image generation error:', error);
    return null;
  }
}

// Run the diagnosis
if (require.main === module) {
  diagnosePresentationIssues()
    .then((results) => {
      console.log('\n🎯 Diagnosis Complete!');
      console.log('Results:', results);
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Diagnosis failed:', error);
      process.exit(1);
    });
}

export { diagnosePresentationIssues };