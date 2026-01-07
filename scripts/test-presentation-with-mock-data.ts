import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function testPresentationWithMockData() {
  console.log('🎯 Testing Presentation System with Mock Data');
  console.log('='.repeat(60));

  // Mock AI-generated content (this is what the AI typically generates)
  const mockAIContent = `# Slide 1: Welcome to the Solar System
**Content:**
• Our solar system is an amazing place in space
• It has one star (the Sun) and eight planets
• Each planet is unique and special
• Let's explore this cosmic neighborhood together!

**Speaker Notes:**
Welcome students to this exciting journey through space! Start by asking them what they already know about space and planets. This will help gauge their prior knowledge and get them excited about learning more.

**Image Prompt:**
Colorful illustration of the solar system showing the Sun in the center with all eight planets orbiting around it, with their names labeled, cartoon style, bright colors, educational diagram suitable for grade 5 students, space background with stars

**Layout:**
title

---

# Slide 2: Learning Objectives
**Content:**
By the end of this lesson, you will be able to:
• Name all eight planets in our solar system
• Put the planets in order from the Sun
• Share one cool fact about each planet
• Understand why planets are different sizes and colors

**Speaker Notes:**
Review these objectives with students so they know what to expect. Emphasize that they'll become "space experts" by the end of the lesson. You might want to return to this slide at the end to check if objectives were met.

**Image Prompt:**
Educational infographic showing learning objectives with space-themed icons: telescope for identifying planets, numbered list for planet order, lightbulb for facts, and magnifying glass for understanding differences, colorful and engaging for elementary students

**Layout:**
content

---

# Slide 3: Meet Our Star - The Sun
**Content:**
• The Sun is the center of our solar system
• It's actually a giant ball of hot gas and fire
• The Sun gives us light and heat every day
• It's so big that over 1 million Earths could fit inside it!
• All planets orbit (go around) the Sun

**Speaker Notes:**
Explain that the Sun isn't actually "on fire" like a campfire, but it's so hot that gases glow. Help students understand the enormous size by comparing it to familiar objects. You might ask: "How do you think the Sun affects life on Earth?"

**Image Prompt:**
Bright, cheerful illustration of the Sun as the center of the solar system, showing its massive size compared to planets, with rays of light extending outward, educational cross-section showing it's made of gas, suitable for elementary students, warm colors

**Layout:**
split

---

# Slide 4: The Inner Planets (Rocky Planets)
**Content:**
The four planets closest to the Sun:
• Mercury - smallest and fastest planet
• Venus - hottest planet, covered in thick clouds
• Earth - our home planet with water and life
• Mars - the "Red Planet" with rusty soil

**Speaker Notes:**
Explain that these are called "rocky planets" because they have solid surfaces you could walk on (though you wouldn't want to walk on most of them!). Compare their sizes and distances from the Sun. Ask students which planet they'd most like to visit and why.

**Image Prompt:**
Educational diagram showing the four inner planets (Mercury, Venus, Earth, Mars) in order from the Sun, with accurate relative sizes and colors, labeled clearly, showing their key characteristics like Earth's blue oceans and Mars' red surface, space background

**Layout:**
image

---

# Slide 5: The Outer Planets (Gas Giants)
**Content:**
The four planets farthest from the Sun:
• Jupiter - largest planet with a giant red spot
• Saturn - famous for its beautiful rings
• Uranus - tilted sideways and blue-green color
• Neptune - windiest planet with dark blue color

**Speaker Notes:**
Explain that these planets are mostly made of gas and don't have solid surfaces like Earth. Jupiter's red spot is actually a giant storm! Saturn's rings are made of ice and rock. Help students remember the order with a fun mnemonic device.

**Image Prompt:**
Stunning illustration of the four outer planets showing Jupiter's Great Red Spot, Saturn's prominent rings, Uranus tilted on its side, and Neptune's deep blue color, with accurate relative sizes, educational labels, space setting with stars

**Layout:**
split

---

# Slide 6: Amazing Solar System Facts!
**Content:**
Cool facts to remember:
• A day on Venus is longer than its year!
• Saturn would float in water because it's mostly gas
• Mars has the largest volcano in the solar system
• Jupiter has over 80 moons!
• You could fit all the other planets inside Jupiter

**Speaker Notes:**
These fun facts help students remember key concepts about each planet. Encourage them to share these facts with family and friends. Ask which fact surprised them the most. This is a great time for questions and discussion.

**Image Prompt:**
Fun, colorful infographic showing amazing solar system facts with cartoon-style illustrations: Venus spinning slowly, Saturn floating in a giant bathtub, Mars with a huge volcano, Jupiter surrounded by many small moons, educational and engaging for grade 5

**Layout:**
content

---`;

  console.log('\n📄 Mock AI Content Generated:');
  console.log('='.repeat(50));
  
  // Parse the mock content
  const slides = parseAIContent(mockAIContent);
  
  console.log(`📊 Total slides parsed: ${slides.length}`);
  
  slides.forEach((slide, index) => {
    console.log(`\n📋 Slide ${index + 1}:`);
    console.log(`   Title: ${slide.title}`);
    console.log(`   Content Lines: ${slide.content ? slide.content.split('\n').filter(line => line.trim()).length : 0}`);
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

  // Test image generation for one slide
  console.log('\n🎨 Testing Image Generation...');
  console.log('='.repeat(40));
  
  const slideWithImage = slides.find(slide => slide.imagePrompt);
  if (slideWithImage) {
    console.log(`📝 Testing image for slide: "${slideWithImage.title}"`);
    console.log(`🖼️ Full Image Prompt:`);
    console.log(`   ${slideWithImage.imagePrompt}`);
    
    try {
      const imageUrl = await generateImage(slideWithImage.imagePrompt, 'educational');
      if (imageUrl) {
        console.log('✅ Image generated successfully!');
        console.log(`🔗 Image URL type: ${imageUrl.startsWith('data:') ? 'Base64 Data URL' : 'HTTP URL'}`);
        console.log(`📏 URL length: ${imageUrl.length} characters`);
      } else {
        console.log('❌ Image generation returned no URL');
      }
    } catch (imageError) {
      console.log(`❌ Image generation failed: ${imageError}`);
    }
  }

  // Test with reduced token count for OpenRouter
  console.log('\n🤖 Testing Reduced Token AI Generation...');
  console.log('='.repeat(50));
  
  try {
    const shortContent = await generateShortAIPresentation({
      subject: 'Science',
      grade: 'Grade 5',
      topic: 'Planets',
      slideCount: 3
    });
    
    if (shortContent) {
      console.log('✅ Short AI content generated successfully!');
      console.log('📄 Content preview:');
      console.log(shortContent.substring(0, 500) + '...');
      
      const shortSlides = parseAIContent(shortContent);
      console.log(`📊 Short presentation slides: ${shortSlides.length}`);
    }
  } catch (aiError) {
    console.log(`❌ AI generation still failed: ${aiError}`);
  }

  // Show what the final structured data looks like
  console.log('\n📊 Final Structured Slide Data:');
  console.log('='.repeat(50));
  
  slides.forEach((slide, index) => {
    console.log(`\nSlide ${index + 1} Structure:`);
    console.log(JSON.stringify({
      title: slide.title,
      type: slide.layout || 'content',
      content: slide.content ? slide.content.substring(0, 100) + '...' : '',
      speakerNotes: slide.speakerNotes ? slide.speakerNotes.substring(0, 100) + '...' : '',
      imagePrompt: slide.imagePrompt ? slide.imagePrompt.substring(0, 100) + '...' : '',
      hasImage: !!slide.imagePrompt
    }, null, 2));
  });

  console.log('\n🎉 Mock Data Test Complete!');
  
  // Summary
  console.log('\n📊 Test Results Summary:');
  console.log(`✅ Content Parsing: ${slides.length > 0 ? 'Working' : 'Failed'}`);
  console.log(`✅ Slide Structure: ${slides.every(s => s.title && s.content) ? 'Good' : 'Needs Review'}`);
  console.log(`✅ Image Prompts: ${slides.every(s => s.imagePrompt) ? 'All slides have prompts' : 'Some missing'}`);
  console.log(`✅ Speaker Notes: ${slides.every(s => s.speakerNotes) ? 'All slides have notes' : 'Some missing'}`);
  console.log(`✅ Layout Types: ${slides.map(s => s.layout).join(', ')}`);
  
  return { slides, mockAIContent };
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
        const errorText = await response.text();
        console.log(`❌ DALL-E 3 failed: ${response.status} - ${errorText}`);
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
        const errorText = await response.text();
        console.log(`❌ Stability AI failed: ${response.status} - ${errorText}`);
      }
    }

    console.log('❌ No image APIs available or all failed');
    return null;

  } catch (error) {
    console.error('❌ Image generation error:', error);
    return null;
  }
}

// Generate short AI content with reduced tokens
async function generateShortAIPresentation(params: {
  subject: string
  grade: string
  topic: string
  slideCount: number
}): Promise<string> {
  try {
    const { subject, grade, topic, slideCount } = params;

    const prompt = `Create ${slideCount} slides about "${topic}" for ${grade} ${subject}. 

Format each slide as:
# Slide X: Title
**Content:** [bullet points]
**Speaker Notes:** [brief notes]
**Image Prompt:** [specific image description]
**Layout:** [title/content/image/split]
---

Keep it concise and educational.`;

    console.log('🤖 Calling OpenRouter AI with reduced tokens...');
    
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
        max_tokens: 600, // Reduced from 4000
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenRouter API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const generatedContent = data.choices[0]?.message?.content;

    if (!generatedContent) {
      throw new Error('No content generated from AI');
    }

    console.log('✅ Short AI content generated successfully');
    return generatedContent;

  } catch (error) {
    console.error('❌ Short AI generation error:', error);
    throw error;
  }
}

// Run the test
if (require.main === module) {
  testPresentationWithMockData()
    .then(() => {
      console.log('\n🎯 Mock data test completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Test failed:', error);
      process.exit(1);
    });
}

export { testPresentationWithMockData };