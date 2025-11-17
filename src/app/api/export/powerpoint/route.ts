import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { generateRealPowerPoint, PowerPointData } from '@/lib/powerpoint-generator';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, content, subject, grade, topic, duration, format = 'pptx' } = await req.json();

    if (!title || !content) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (format === 'pptx') {
      // Convert the content to PowerPointData format
      const slides = content.slides || [];
      const powerpointData: PowerPointData = {
        title,
        subject,
        grade,
        topic,
        duration: duration || 45,
        slides: slides.map((slide: any) => ({
          id: slide.id || Date.now().toString(),
          title: slide.title || '',
          content: slide.content || '',
          slideType: slide.slideType || 'content',
          speakerNotes: slide.speakerNotes || '',
          visualSuggestions: slide.visualSuggestions || [],
          order: slide.order || 1
        })),
        metadata: content.metadata || {
          objectives: [],
          difficulty: 'medium',
          format: 'standard'
        }
      };

      const pptxBuffer = await generateRealPowerPoint(powerpointData);
      
      return new NextResponse(pptxBuffer, {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
          'Content-Disposition': `attachment; filename="${title.replace(/[^a-z0-9]/gi, '_')}-presentation.pptx"`
        }
      });
    } else if (format === 'pdf') {
      // For PDF, we'll generate an HTML version that can be printed to PDF
      const pdfContent = await generatePDF({ title, content, subject, grade, topic, duration });
      return new NextResponse(pdfContent, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${title.replace(/[^a-z0-9]/gi, '_')}-presentation.pdf"`
        }
      });
    } else {
      return NextResponse.json({ error: 'Unsupported format' }, { status: 400 });
    }

  } catch (error) {
    console.error('Error exporting PowerPoint:', error);
    return NextResponse.json(
      { error: 'Failed to export PowerPoint' },
      { status: 500 }
    );
  }
}

async function generatePDF(powerpoint: any) {
  // For now, generate an HTML version that can be printed to PDF
  // In a real implementation, you would use a library like Puppeteer or jsPDF
  
  const html = generatePowerPointHTML(powerpoint);
  
  // Convert HTML to PDF using a simple approach
  // In production, you'd want to use a proper PDF generation library
  const pdfBuffer = Buffer.from(html, 'utf-8');
  return pdfBuffer;
}

async function generatePPTX(powerpoint: any) {
  // For now, generate a simple text-based representation
  // In a real implementation, you would use a library like officegen or pptxgenjs
  
  const pptxContent = generatePowerPointText(powerpoint);
  const buffer = Buffer.from(pptxContent, 'utf-8');
  return buffer;
}

function generatePowerPointHTML(powerpoint: any) {
  const slides = powerpoint.content?.slides || [];
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${powerpoint.title}</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
        }
        .presentation-container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 10px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            overflow: hidden;
        }
        .presentation-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .presentation-title {
            font-size: 2.5em;
            margin: 0 0 10px 0;
            font-weight: 700;
        }
        .presentation-subtitle {
            font-size: 1.2em;
            margin: 0;
            opacity: 0.9;
        }
        .presentation-meta {
            display: flex;
            justify-content: center;
            gap: 30px;
            margin-top: 20px;
            font-size: 0.9em;
            opacity: 0.8;
        }
        .slide {
            page-break-after: always;
            padding: 40px;
            min-height: 80vh;
            display: flex;
            flex-direction: column;
            justify-content: center;
        }
        .slide:last-child {
            page-break-after: avoid;
        }
        .slide-header {
            border-bottom: 3px solid #667eea;
            padding-bottom: 15px;
            margin-bottom: 30px;
        }
        .slide-title {
            font-size: 2em;
            color: #333;
            margin: 0 0 10px 0;
            font-weight: 600;
        }
        .slide-type {
            display: inline-block;
            background: #667eea;
            color: white;
            padding: 5px 15px;
            border-radius: 20px;
            font-size: 0.8em;
            font-weight: 500;
            text-transform: uppercase;
        }
        .slide-content {
            font-size: 1.1em;
            line-height: 1.6;
            color: #555;
            white-space: pre-wrap;
        }
        .slide-notes {
            background: #f8f9fa;
            border-left: 4px solid #667eea;
            padding: 15px;
            margin-top: 20px;
            font-style: italic;
            color: #666;
        }
        .slide-visuals {
            background: #e8f5e8;
            border-left: 4px solid #28a745;
            padding: 15px;
            margin-top: 15px;
            color: #666;
        }
        .slide-number {
            position: absolute;
            bottom: 20px;
            right: 20px;
            background: #667eea;
            color: white;
            padding: 5px 15px;
            border-radius: 15px;
            font-size: 0.9em;
        }
        .slide {
            position: relative;
        }
        @media print {
            body {
                background: white;
            }
            .presentation-container {
                box-shadow: none;
                border-radius: 0;
            }
            .slide {
                page-break-after: always;
                min-height: 90vh;
            }
        }
    </style>
</head>
<body>
    <div class="presentation-container">
        <div class="presentation-header">
            <h1 class="presentation-title">${powerpoint.title}</h1>
            <p class="presentation-subtitle">${powerpoint.topic}</p>
            <div class="presentation-meta">
                <span>📚 ${powerpoint.subject}</span>
                <span>🎓 ${powerpoint.grade}</span>
                <span>⏱️ ${powerpoint.duration} minutes</span>
                <span>📊 ${slides.length} slides</span>
            </div>
        </div>
        
        ${slides.map((slide: any, index: number) => `
            <div class="slide">
                <div class="slide-header">
                    <h2 class="slide-title">${slide.title || `Slide ${index + 1}`}</h2>
                    <span class="slide-type">${slide.slideType || 'content'}</span>
                </div>
                <div class="slide-content">${slide.content || 'No content available'}</div>
                ${slide.speakerNotes ? `
                    <div class="slide-notes">
                        <strong>Speaker Notes:</strong> ${slide.speakerNotes}
                    </div>
                ` : ''}
                ${slide.visualSuggestions && slide.visualSuggestions.length > 0 ? `
                    <div class="slide-visuals">
                        <strong>Visual Suggestions:</strong> ${slide.visualSuggestions.join(', ')}
                    </div>
                ` : ''}
                <div class="slide-number">${index + 1} / ${slides.length}</div>
            </div>
        `).join('')}
    </div>
</body>
</html>`;
}

function generatePowerPointText(powerpoint: any) {
  const slides = powerpoint.content?.slides || [];
  
  let content = `POWERPOINT PRESENTATION: ${powerpoint.title}\n`;
  content += `Subject: ${powerpoint.subject}\n`;
  content += `Grade: ${powerpoint.grade}\n`;
  content += `Topic: ${powerpoint.topic}\n`;
  content += `Duration: ${powerpoint.duration} minutes\n`;
  content += `Total Slides: ${slides.length}\n`;
  content += `Generated: ${new Date().toLocaleString()}\n`;
  content += `\n${'='.repeat(80)}\n\n`;
  
  slides.forEach((slide: any, index: number) => {
    content += `SLIDE ${index + 1}: ${slide.title || 'Untitled'}\n`;
    content += `Type: ${slide.slideType || 'content'}\n`;
    content += `${'-'.repeat(40)}\n`;
    content += `${slide.content || 'No content available'}\n`;
    
    if (slide.speakerNotes) {
      content += `\nSpeaker Notes: ${slide.speakerNotes}\n`;
    }
    
    if (slide.visualSuggestions && slide.visualSuggestions.length > 0) {
      content += `\nVisual Suggestions: ${slide.visualSuggestions.join(', ')}\n`;
    }
    
    content += `\n${'='.repeat(80)}\n\n`;
  });
  
  return content;
}
