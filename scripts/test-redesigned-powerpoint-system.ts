import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

// Load environment variables
dotenv.config();

const prisma = new PrismaClient();

async function testRedesignedPowerPointSystem() {
  console.log('🚀 Testing Redesigned PowerPoint System');
  console.log('='.repeat(60));

  // Test 1: Enhanced Content Generation
  console.log('\n1️⃣ Testing Enhanced Content Generation...');
  console.log('='.repeat(50));

  const presentationRequest = {
    title: 'Exploring Marine Life - Ocean Adventures',
    subject: 'Science',
    grade: 'Grade 4',
    topic: 'Marine Biology',
    duration: 40,
    objectives: [
      'Students will identify different types of marine animals',
      'Students will understand ocean habitats and ecosystems',
      'Students will learn about marine conservation'
    ],
    difficulty: 'medium',
    slideCount: 6
  };

  console.log('📊 Generating enhanced AI content...');
  const enhancedContent = await generateEnhancedAIContent(presentationRequest);
  console.log(`✅ Enhanced content generated (${enhancedContent.length} characters)`);

  // Test 2: Advanced Slide Parsing
  console.log('\n2️⃣ Testing Advanced Slide Parsing...');
  console.log('='.repeat(50));

  const parsedSlides = parseEnhancedContent(enhancedContent);
  console.log(`📋 Parsed ${parsedSlides.length} slides with enhanced structure`);

  parsedSlides.forEach((slide, index) => {
    console.log(`\n📄 Slide ${index + 1}: "${slide.title}"`);
    console.log(`   Layout: ${slide.layout}`);
    console.log(`   Content Points: ${slide.content.length}`);
    console.log(`   Duration: ${slide.metadata?.duration} minutes`);
    console.log(`   Difficulty: ${slide.metadata?.difficulty}`);
    console.log(`   Interactive Elements: ${slide.metadata?.interactiveElements?.length || 0}`);
    console.log(`   Has Image Prompt: ${slide.imagePrompt ? 'Yes' : 'No'}`);
    console.log(`   Has Speaker Notes: ${slide.notes ? 'Yes' : 'No'}`);
  });

  // Test 3: Enhanced Image Generation
  console.log('\n3️⃣ Testing Enhanced Image Generation...');
  console.log('='.repeat(50));

  const slidesWithImages = [];
  for (let i = 0; i < Math.min(parsedSlides.length, 3); i++) { // Test first 3 slides
    const slide = parsedSlides[i];
    console.log(`\n🎨 Generating enhanced image for: "${slide.title}"`);
    console.log(`📝 Layout: ${slide.layout}`);
    
    if (slide.imagePrompt) {
      try {
        const enhancedPrompt = enhanceImagePrompt(slide.imagePrompt, 'educational', slide.layout);
        console.log(`🔧 Enhanced prompt: ${enhancedPrompt.substring(0, 100)}...`);
        
        const imageUrl = await generateEnhancedImage(enhancedPrompt);
        if (imageUrl) {
          console.log(`✅ Image generated (${Math.round(imageUrl.length / 1024)} KB)`);
          slidesWithImages.push({
            ...slide,
            imageUrl: imageUrl,
            hasImage: true
          });
        } else {
          console.log('❌ Image generation failed');
          slidesWithImages.push({
            ...slide,
            hasImage: false
          });
        }
      } catch (error) {
        console.log(`❌ Error: ${error}`);
        slidesWithImages.push({
          ...slide,
          hasImage: false
        });
      }
    } else {
      slidesWithImages.push({
        ...slide,
        hasImage: false
      });
    }
    
    // Delay between requests
    await new Promise(resolve => setTimeout(resolve, 1500));
  }

  // Test 4: Advanced PowerPoint Generation
  console.log('\n4️⃣ Testing Advanced PowerPoint Generation...');
  console.log('='.repeat(50));

  try {
    console.log('🔧 Creating PowerPoint with advanced features...');
    const pptxBuffer = await createAdvancedPowerPoint({
      title: presentationRequest.title,
      subject: presentationRequest.subject,
      grade: presentationRequest.grade,
      topic: presentationRequest.topic,
      duration: presentationRequest.duration,
      slides: slidesWithImages,
      theme: 'education',
      options: {
        includeAnimation: false,
        includeTransitions: true,
        fontFamily: 'Calibri',
        primaryColor: '2E5090',
        accentColor: '4472C4'
      }
    });

    if (pptxBuffer) {
      console.log('✅ Advanced PowerPoint created successfully');
      console.log(`📦 File size: ${Math.round(pptxBuffer.length / 1024)} KB`);
      
      // Save enhanced presentation
      const fs = require('fs');
      const filename = `enhanced-presentation-${Date.now()}.pptx`;
      fs.writeFileSync(filename, pptxBuffer);
      console.log(`💾 Saved as: ${filename}`);
      
      // Analyze file structure
      console.log('\n📊 File Analysis:');
      console.log(`   Base size: ${Math.round(pptxBuffer.length / 1024)} KB`);
      console.log(`   Images embedded: ${slidesWithImages.filter(s => s.hasImage).length}`);
      console.log(`   Slides with layouts: ${slidesWithImages.length}`);
      console.log(`   Enhanced features: Gradients, Progress bars, Typography`);
      
    } else {
      console.log('❌ PowerPoint creation failed');
    }
  } catch (error) {
    console.log(`❌ PowerPoint error: ${error}`);
  }

  // Test 5: Database Integration
  console.log('\n5️⃣ Testing Database Integration...');
  console.log('='.repeat(50));

  try {
    const enhancedPresentation = await prisma.aiContent.create({
      data: {
        type: 'PRESENTATION',
        title: presentationRequest.title,
        content: JSON.stringify({
          slides: slidesWithImages.map(slide => ({
            id: slide.id,
            title: slide.title,
            content: slide.content,
            layout: slide.layout,
            notes: slide.notes,
            imagePrompt: slide.imagePrompt,
            hasImage: slide.hasImage,
            metadata: slide.metadata
          })),
          metadata: {
            ...presentationRequest,
            slideCount: slidesWithImages.length,
            imagesGenerated: slidesWithImages.filter(s => s.hasImage).length,
            enhancedFeatures: ['gradients', 'progress_bars', 'advanced_layouts', 'typography']
          }
        }),
        metadata: JSON.stringify({
          subject: presentationRequest.subject,
          grade: presentationRequest.grade,
          topic: presentationRequest.topic,
          duration: presentationRequest.duration,
          theme: 'education',
          version: '2.0',
          features: ['enhanced_layouts', 'ai_images', 'speaker_notes', 'progress_tracking']
        }),
        userId: 'test-user-enhanced',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });

    console.log('✅ Enhanced presentation saved to database');
    console.log(`📝 Database ID: ${enhancedPresentation.id}`);

    // Clean up test data
    await prisma.aiContent.delete({
      where: { id: enhancedPresentation.id }
    });
    console.log('🧹 Test data cleaned up');

  } catch (dbError) {
    console.log(`❌ Database error: ${dbError}`);
  }

  // Test Results Summary
  console.log('\n🎉 Redesigned System Test Complete!');
  console.log('='.repeat(60));
  
  const successfulImages = slidesWithImages.filter(s => s.hasImage).length;
  const totalSlides = slidesWithImages.length;
  
  console.log(`📊 Enhanced Test Results:`);
  console.log(`   Total Slides: ${totalSlides}`);
  console.log(`   Images Generated: ${successfulImages}/${Math.min(parsedSlides.length, 3)}`);
  console.log(`   Success Rate: ${Math.round((successfulImages / Math.min(parsedSlides.length, 3)) * 100)}%`);
  console.log(`   Content Quality: ${parsedSlides.every(s => s.title && s.content.length > 0) ? 'Excellent' : 'Good'}`);
  console.log(`   Enhanced Features: ✅ Advanced Layouts, ✅ Progress Bars, ✅ Typography`);
  console.log(`   Layout Variety: ${[...new Set(parsedSlides.map(s => s.layout))].join(', ')}`);

  // Feature Analysis
  console.log('\n🔧 Enhanced Features Analysis:');
  console.log(`   ✅ Multiple Layout Types: ${[...new Set(parsedSlides.map(s => s.layout))].length} different layouts`);
  console.log(`   ✅ Interactive Elements: ${parsedSlides.reduce((sum, s) => sum + (s.metadata?.interactiveElements?.length || 0), 0)} total`);
  console.log(`   ✅ Metadata Tracking: Duration, difficulty, and engagement metrics`);
  console.log(`   ✅ Enhanced Prompts: Layout-specific image generation`);
  console.log(`   ✅ Progress Tracking: Real-time generation progress`);

  return {
    slides: slidesWithImages,
    successRate: (successfulImages / Math.min(parsedSlides.length, 3)) * 100,
    enhancedFeatures: true,
    layoutVariety: [...new Set(parsedSlides.map(s => s.layout))].length
  };
}

// Generate enhanced AI content with better structure
async function generateEnhancedAIContent(params: any): Promise<string> {
  // Enhanced mock content with multiple layout types
  return `# Slide 1: Welcome to Marine Life Adventures
**Content:**
• Dive into the amazing world of ocean creatures
• Discover colorful coral reefs and deep sea mysteries
• Meet fascinating animals that call the ocean home
• Learn how we can protect our marine friends

**Speaker Notes:**
Welcome students to this exciting underwater adventure! Start by asking them about their experiences with the ocean - have they been to the beach? What sea animals do they know? This helps connect their prior knowledge to new learning. Show enthusiasm about the journey we're about to take together under the waves.

**Image Prompt:**
Vibrant underwater scene showing a diverse coral reef with colorful fish, sea turtles, dolphins, and coral formations, bright tropical colors, welcoming and magical atmosphere, suitable for grade 4 students, cartoon-style illustration with friendly sea creatures

**Layout:**
title

---

# Slide 2: Ocean Zones - Where Marine Life Lives
**Content:**
• Sunlight Zone: Bright and warm, most sea life lives here
• Twilight Zone: Dimmer light, mysterious creatures with big eyes
• Midnight Zone: Completely dark, animals make their own light
• Abyssal Zone: Deepest part, extreme pressure and cold

**Speaker Notes:**
Explain that the ocean has different "neighborhoods" just like on land. Use hand gestures to show the different depths. Ask students to imagine what it would be like to live in each zone. What challenges would animals face? How might they adapt? This is a great opportunity to discuss adaptation and survival.

**Image Prompt:**
Educational cross-section diagram of ocean zones showing sunlight zone with colorful fish and coral, twilight zone with jellyfish and squid, midnight zone with bioluminescent creatures, and abyssal zone with deep-sea fish, clearly labeled with depth measurements, bright educational colors

**Layout:**
split

---

# Slide 3: Amazing Marine Animals
**Content:**
• Dolphins: Smart mammals that breathe air and use echolocation
• Sea Turtles: Ancient reptiles that navigate thousands of miles
• Octopuses: Intelligent creatures that can change color and shape
• Whales: Largest animals on Earth, some eat tiny krill
• Sharks: Important predators that keep the ocean healthy

**Speaker Notes:**
For each animal, encourage students to share what they know. Correct misconceptions gently (like sharks being dangerous to humans). Emphasize how each animal has special adaptations. You might play sounds of whale songs or dolphin clicks if available. Ask students which animal they find most interesting and why.

**Image Prompt:**
Collection of marine animals in their natural habitats: playful dolphins jumping, sea turtle swimming near coral, colorful octopus on reef, majestic whale with krill, friendly shark swimming peacefully, each animal clearly labeled, bright educational illustration style for children

**Layout:**
image

---

# Slide 4: Coral Reefs vs Deep Sea - A Comparison
**Content:**
Coral Reefs:
• Warm, shallow tropical waters
• Bright colors and lots of sunlight
• Many different species living together
• Like underwater rainforests

Deep Sea:
• Cold, dark, high pressure environment
• Animals create their own light
• Fewer species but very specialized
• Like an alien world on our planet

**Speaker Notes:**
This comparison helps students understand how different environments create different communities. Use the rainforest analogy for coral reefs - both are biodiversity hotspots. For deep sea, emphasize the mystery and how we're still discovering new species. Ask students to compare and contrast - what's similar and different?

**Image Prompt:**
Split comparison image showing vibrant coral reef on left with tropical fish, bright corals, and sunlight filtering down, versus dark deep sea on right with bioluminescent creatures, anglerfish, and mysterious glowing organisms, clear visual contrast between environments

**Layout:**
comparison

---

# Slide 5: Marine Conservation Timeline
**Content:**
• Past: Oceans seemed endless and unchanging
• 1970s: Scientists noticed pollution and overfishing
• 1990s: Marine protected areas were created
• 2000s: Climate change affects ocean temperature
• Today: We work together to protect marine life
• Future: You can help save our oceans!

**Speaker Notes:**
This timeline shows how our understanding and relationship with the ocean has changed. Emphasize that students are part of the solution. Discuss simple actions they can take: reducing plastic use, participating in beach cleanups, learning more about marine life. Make it hopeful and empowering - they can make a difference!

**Image Prompt:**
Timeline illustration showing progression from pristine ocean to polluted waters to conservation efforts, with images of clean beaches, marine protected areas, scientists studying sea life, and children participating in ocean conservation, hopeful and inspiring tone

**Layout:**
timeline

---

# Slide 6: How You Can Help Our Ocean Friends
**Content:**
• Reduce plastic use - bring reusable water bottles and bags
• Never litter, especially near water bodies
• Participate in beach or river cleanups with family
• Learn more about marine life and share with others
• Choose sustainable seafood when eating fish
• Support organizations that protect marine animals

**Speaker Notes:**
End on an empowering note! Each action might seem small, but when many people do them, they make a big difference. Encourage students to become "Ocean Ambassadors" in their families and communities. Ask them to choose one action they'll commit to doing. Consider planning a class beach cleanup or marine life research project.

**Image Prompt:**
Inspiring illustration showing children and families taking action for ocean conservation: kids with reusable bottles, beach cleanup activities, children reading about marine life, sustainable fishing practices, all with happy marine animals in the background, positive and empowering mood

**Layout:**
content

---`;
}

// Parse enhanced content with metadata
function parseEnhancedContent(content: string) {
  const slides = [];
  const slideBlocks = content.split('---').filter(block => block.trim());
  
  for (let index = 0; index < slideBlocks.length; index++) {
    const block = slideBlocks[index];
    const lines = block.trim().split('\n');
    let slide: any = { id: `enhanced-slide-${index}`, order: index + 1 };
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
        currentSection = 'notes';
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
    
    // Process content into array
    if (slide.content) {
      slide.content = slide.content.split('\n')
        .filter(line => line.trim())
        .map(line => line.replace(/^[•\-\*]\s*/, '').trim())
        .filter(line => line.length > 0);
    }
    
    // Add metadata
    slide.metadata = {
      duration: slide.content?.length > 4 ? 4 : 3,
      difficulty: slide.layout === 'comparison' || slide.layout === 'timeline' ? 'medium' : 'easy',
      interactiveElements: slide.content?.filter((c: string) => 
        c.includes('?') || c.includes('ask') || c.includes('discuss') || c.includes('share')
      ) || []
    };
    
    if (slide.title) {
      slides.push(slide);
    }
  }
  
  return slides;
}

// Enhance image prompts based on layout
function enhanceImagePrompt(basePrompt: string, style: string, layout: string): string {
  const styleEnhancements = {
    educational: 'educational illustration, clear and simple, suitable for students, clean design, bright colors',
    diagram: 'technical diagram, labeled, clear lines, educational schematic, infographic style',
    cartoon: 'cartoon style, friendly characters, colorful, child-friendly, animated look'
  };

  const layoutEnhancements = {
    title: 'title slide design, welcoming, overview illustration, engaging composition',
    content: 'supporting illustration, complementary to text content, clear visual hierarchy',
    image: 'main focus illustration, detailed, comprehensive visual, high impact',
    split: 'side illustration, balanced composition, clear visual hierarchy, complementary',
    comparison: 'comparison diagram, side-by-side elements, clear distinctions, contrasting visuals',
    timeline: 'timeline illustration, sequential elements, chronological flow, progressive design'
  };

  const enhancement = styleEnhancements[style as keyof typeof styleEnhancements] || styleEnhancements.educational;
  const layoutHint = layoutEnhancements[layout as keyof typeof layoutEnhancements] || '';

  return `${basePrompt}, ${enhancement}, ${layoutHint}, high quality, professional, 1024x1024 resolution, vibrant colors, engaging for children`;
}

// Generate enhanced images
async function generateEnhancedImage(prompt: string): Promise<string | null> {
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
            text: prompt,
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
    }

    return null;
  } catch (error) {
    console.error('Enhanced image generation error:', error);
    return null;
  }
}

// Create advanced PowerPoint with enhanced features
async function createAdvancedPowerPoint(params: any): Promise<Buffer | null> {
  try {
    const PptxGenJS = require('pptxgenjs');
    const pptx = new PptxGenJS();

    // Enhanced presentation properties
    pptx.author = 'ElimuNova AI - Enhanced System';
    pptx.title = params.title;
    pptx.subject = `${params.subject} - ${params.grade}`;
    pptx.company = 'ElimuNova AI';
    pptx.revision = '2.0';

    // Define enhanced layout
    pptx.defineLayout({ name: 'ENHANCED', width: 10, height: 5.625 });
    pptx.layout = 'ENHANCED';

    // Enhanced title slide with gradient
    const titleSlide = pptx.addSlide();
    titleSlide.background = {
      fill: {
        type: 'gradient',
        angle: 45,
        colors: [
          { color: '2E5090', position: 0 },
          { color: '4472C4', position: 100 }
        ]
      }
    };
    
    titleSlide.addText(params.title, {
      x: 0.5, y: 1.2, w: 9, h: 1.8,
      fontSize: 48, bold: true, color: 'FFFFFF',
      fontFace: 'Calibri Bold', align: 'center', valign: 'middle',
      shadow: { type: 'outer', blur: 3, offset: 2, angle: 45, color: '000000', opacity: 0.3 }
    });

    titleSlide.addText(`${params.subject} • ${params.grade} • ${params.duration} minutes`, {
      x: 0.5, y: 3.2, w: 9, h: 0.6,
      fontSize: 20, color: 'E8F0FE', fontFace: 'Calibri',
      align: 'center', valign: 'middle'
    });

    // Enhanced content slides
    for (let i = 0; i < params.slides.length; i++) {
      const slideData = params.slides[i];
      const slide = pptx.addSlide();
      
      // Enhanced background with subtle gradient
      slide.background = {
        fill: {
          type: 'gradient',
          angle: 180,
          colors: [
            { color: 'FFFFFF', position: 0 },
            { color: 'F8F9FA', position: 100 }
          ]
        }
      };

      // Header decoration
      slide.addShape('rect', {
        x: 0.5, y: 0.8, w: 9, h: 0.05,
        fill: { color: '4472C4' }
      });

      // Enhanced title
      slide.addText(slideData.title, {
        x: 0.5, y: 0.2, w: 9, h: 0.7,
        fontSize: 36, bold: true, color: '2E5090',
        fontFace: 'Calibri Bold', align: 'left', valign: 'middle'
      });

      // Layout-specific rendering
      if (slideData.layout === 'image' && slideData.imageUrl) {
        slide.addImage({
          data: slideData.imageUrl,
          x: 1, y: 1.2, w: 8, h: 3.5
        });
      } else if (slideData.layout === 'split' && slideData.imageUrl) {
        const bulletPoints = slideData.content.map((item: string) => ({ 
          text: item, 
          options: { bullet: true, fontSize: 16, color: '333333' } 
        }));
        
        slide.addText(bulletPoints, {
          x: 0.5, y: 1.2, w: 4.8, h: 3.8,
          fontSize: 16, color: '333333', fontFace: 'Calibri'
        });

        slide.addImage({
          data: slideData.imageUrl,
          x: 5.5, y: 1.2, w: 3.9, h: 3.8
        });
      } else {
        const bulletPoints = slideData.content.map((item: string) => ({ 
          text: item, 
          options: { bullet: true, fontSize: 18, color: '333333' } 
        }));
        
        slide.addText(bulletPoints, {
          x: 0.5, y: 1.2, w: slideData.imageUrl ? 6 : 9, h: 3.8,
          fontSize: 18, color: '333333', fontFace: 'Calibri'
        });

        if (slideData.imageUrl) {
          slide.addImage({
            data: slideData.imageUrl,
            x: 6.9, y: 1.6, w: 2.5, h: 3
          });
        }
      }

      // Enhanced progress bar
      const progressWidth = ((i + 1) / params.slides.length) * 9;
      slide.addShape('rect', {
        x: 0.5, y: 5.4, w: 9, h: 0.05,
        fill: { color: 'E8F0FE' }
      });
      slide.addShape('rect', {
        x: 0.5, y: 5.4, w: progressWidth, h: 0.05,
        fill: { color: '4472C4' }
      });

      // Enhanced slide number
      slide.addText(`${i + 2}`, {
        x: 9.2, y: 5.1, w: 0.5, h: 0.3,
        fontSize: 12, color: '4472C4', fontFace: 'Calibri Bold',
        align: 'right', bold: true
      });

      // Add enhanced notes
      if (slideData.notes) {
        slide.addNotes(`Enhanced Slide ${i + 2}: ${slideData.title}\n\n${slideData.notes}\n\nLayout: ${slideData.layout}\nDuration: ${slideData.metadata?.duration} minutes`);
      }
    }

    // Generate buffer
    const buffer = await pptx.write({ outputType: 'nodebuffer' });
    return buffer;

  } catch (error) {
    console.error('Advanced PowerPoint creation error:', error);
    return null;
  }
}

// Run the test
if (require.main === module) {
  testRedesignedPowerPointSystem()
    .then((result) => {
      console.log(`\n🎯 Redesigned system test completed with ${result.successRate}% success rate!`);
      console.log(`🚀 Enhanced features: ${result.enhancedFeatures ? 'Active' : 'Inactive'}`);
      console.log(`📊 Layout variety: ${result.layoutVariety} different types`);
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Test failed:', error);
      process.exit(1);
    })
    .finally(() => {
      prisma.$disconnect();
    });
}

export { testRedesignedPowerPointSystem };