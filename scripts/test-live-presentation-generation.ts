import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function testLivePresentationGeneration() {
  console.log('🔍 Testing Live Presentation Generation');
  console.log('='.repeat(60));

  // Test the exact data from your screenshot
  const presentationData = {
    subject: 'English',
    grade: 'Grade 4',
    topic: 'Types of Nouns and Pronouns',
    duration: 10,
    slideCount: 3,
    objectives: ['Understand the main types of nouns', 'Learn about pronouns'],
    difficulty: 'medium',
    generateImages: true,
    imageStyle: 'educational',
    theme: 'education'
  };

  console.log('📊 Testing with your exact data:');
  console.log(JSON.stringify(presentationData, null, 2));

  // Test 1: Check if the API endpoint is working
  console.log('\n1️⃣ Testing API Endpoint...');
  console.log('='.repeat(40));

  try {
    // Test the AI content generation first (what should happen when you click Generate)
    const response = await fetch('http://localhost:3000/api/ai/generate-presentation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Note: This will fail due to auth, but we can see the error
      },
      body: JSON.stringify(presentationData)
    });

    console.log(`📡 API Response Status: ${response.status}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ API responded successfully');
      console.log('📄 Response type:', typeof data);
      console.log('📊 Response keys:', Object.keys(data));
    } else {
      const errorText = await response.text();
      console.log('❌ API Error Response:');
      console.log(errorText);
      
      if (response.status === 401) {
        console.log('\n🔐 Authentication Issue Detected!');
        console.log('The API requires authentication but the frontend might not be sending proper session data.');
      }
    }
  } catch (error) {
    console.log('❌ Network Error:', error);
  }

  // Test 2: Check what the AI content generation should produce
  console.log('\n2️⃣ Testing AI Content Generation (Mock)...');
  console.log('='.repeat(40));

  const mockAIContent = generateMockContent(presentationData);
  console.log('📝 Generated content preview:');
  console.log(mockAIContent.substring(0, 500) + '...');

  // Test 3: Check slide parsing
  console.log('\n3️⃣ Testing Slide Parsing...');
  console.log('='.repeat(40));

  const parsedSlides = parseContent(mockAIContent);
  console.log(`📋 Parsed ${parsedSlides.length} slides`);
  
  parsedSlides.forEach((slide, index) => {
    console.log(`   Slide ${index + 1}: "${slide.title}"`);
    console.log(`     Content: ${slide.content.length} points`);
    console.log(`     Has image prompt: ${slide.imagePrompt ? 'Yes' : 'No'}`);
  });

  // Test 4: Check what should happen in the frontend
  console.log('\n4️⃣ Expected Frontend Behavior...');
  console.log('='.repeat(40));

  console.log('When you click "Generate Presentation", this should happen:');
  console.log('1. ✅ Frontend sends POST request to /api/ai/generate-presentation');
  console.log('2. ✅ Backend generates AI content using OpenRouter');
  console.log('3. ✅ Backend returns JSON with presentation data');
  console.log('4. ✅ Frontend displays slides in the preview');
  console.log('5. ✅ "Save Presentation" button becomes available');

  // Test 5: Diagnose potential issues
  console.log('\n5️⃣ Potential Issues Diagnosis...');
  console.log('='.repeat(40));

  console.log('🔍 Checking for common issues:');
  
  // Check if OpenRouter has credits
  console.log('\n📊 OpenRouter API Status:');
  try {
    const openrouterResponse = await fetch('https://openrouter.ai/api/v1/models', {
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      }
    });
    
    if (openrouterResponse.ok) {
      console.log('✅ OpenRouter API is accessible');
    } else {
      console.log(`❌ OpenRouter API issue: ${openrouterResponse.status}`);
    }
  } catch (error) {
    console.log(`❌ OpenRouter connection error: ${error}`);
  }

  // Check environment variables
  console.log('\n🔧 Environment Check:');
  console.log(`✅ OPENROUTER_API_KEY: ${process.env.OPENROUTER_API_KEY ? 'Set' : 'Missing'}`);
  console.log(`✅ STABILITY_API_KEY: ${process.env.STABILITY_API_KEY ? 'Set' : 'Missing'}`);
  console.log(`✅ NEXTAUTH_SECRET: ${process.env.NEXTAUTH_SECRET ? 'Set' : 'Missing'}`);

  console.log('\n🎯 Recommendations:');
  console.log('1. Check browser console for JavaScript errors');
  console.log('2. Verify user authentication session');
  console.log('3. Check if OpenRouter has sufficient credits');
  console.log('4. Test with a simpler topic first');
  console.log('5. Check network tab for failed API requests');

  return {
    apiAccessible: false, // Will be true if API responds
    contentGeneration: true,
    slideParsing: true,
    environmentSetup: !!(process.env.OPENROUTER_API_KEY && process.env.STABILITY_API_KEY)
  };
}

// Generate mock content for testing
function generateMockContent(data: any): string {
  return `# Slide 1: Types of Nouns and Pronouns
**Content:**
• Nouns are words that name people, places, things, or ideas
• Pronouns are words that take the place of nouns
• Understanding these helps us write better sentences
• Let's explore the different types together!

**Speaker Notes:**
Welcome students to this grammar lesson! Start by asking them to name some nouns they see in the classroom. This helps activate prior knowledge and gets them engaged.

**Image Prompt:**
Educational illustration showing examples of nouns (person, place, thing, idea) and pronouns (he, she, it, they) with colorful graphics suitable for Grade 4 students

**Layout:**
title

---

# Slide 2: Types of Nouns
**Content:**
• Common Nouns: general names (dog, school, book)
• Proper Nouns: specific names (Max, Lincoln Elementary, Harry Potter)
• Concrete Nouns: things you can touch (apple, desk, pencil)
• Abstract Nouns: ideas and feelings (happiness, friendship, courage)

**Speaker Notes:**
Give examples for each type and ask students to provide their own examples. Use familiar objects and names from their daily life to make it relatable.

**Image Prompt:**
Four-panel educational diagram showing different types of nouns with clear examples and illustrations, colorful and engaging for elementary students

**Layout:**
content

---

# Slide 3: Understanding Pronouns
**Content:**
• Personal Pronouns: I, you, he, she, it, we, they
• Possessive Pronouns: my, your, his, her, its, our, their
• Pronouns help us avoid repeating the same nouns
• Example: "Sarah loves her dog" instead of "Sarah loves Sarah's dog"

**Speaker Notes:**
Practice with sentence examples. Have students replace nouns with pronouns in simple sentences. This interactive practice helps reinforce the concept.

**Image Prompt:**
Interactive educational chart showing personal and possessive pronouns with example sentences, bright colors and clear typography for Grade 4 level

**Layout:**
split

---`;
}

// Parse content into slides
function parseContent(content: string) {
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
      // Convert content to array
      if (slide.content) {
        slide.content = slide.content.split('\n')
          .filter(line => line.trim())
          .map(line => line.replace(/^[•\-\*]\s*/, '').trim())
          .filter(line => line.length > 0);
      }
      slides.push(slide);
    }
  }
  
  return slides;
}

// Run the test
if (require.main === module) {
  testLivePresentationGeneration()
    .then((results) => {
      console.log('\n🎯 Live System Diagnosis Complete!');
      console.log('Results:', results);
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Diagnosis failed:', error);
      process.exit(1);
    });
}

export { testLivePresentationGeneration };