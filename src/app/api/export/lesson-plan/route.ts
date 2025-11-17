import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'TEACHER') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { content, title, subject, grade, topic, duration, format } = body

    if (!content || !format) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (format === 'pdf') {
      // Generate PDF using HTML to PDF conversion
      const htmlContent = generateHTMLContent(content, title, subject, grade, topic, duration)
      
      // Return HTML that can be printed as PDF
      const response = new NextResponse(htmlContent, {
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Content-Disposition': `attachment; filename="${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_lesson_plan.html"`,
        },
      })
      
      return response
    } else if (format === 'word') {
      // Generate Word document using HTML format that Word can open
      const htmlContent = generateWordHTMLContent(content, title, subject, grade, topic, duration)
      
      const response = new NextResponse(htmlContent, {
        headers: {
          'Content-Type': 'application/msword; charset=utf-8',
          'Content-Disposition': `attachment; filename="${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_lesson_plan.doc"`,
        },
      })
      
      return response
    } else {
      return NextResponse.json(
        { error: 'Invalid format. Use "pdf" or "word"' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Error generating document:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function generateHTMLContent(content: string, title: string, subject: string, grade: string, topic: string, duration: number): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background: white;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            border-radius: 10px;
            margin-bottom: 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 600;
        }
        .header .subtitle {
            margin-top: 10px;
            opacity: 0.9;
            font-size: 16px;
        }
        .content {
            background: #f8f9fa;
            padding: 30px;
            border-radius: 10px;
            border-left: 4px solid #667eea;
        }
        .content pre {
            white-space: pre-wrap;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            font-size: 14px;
            line-height: 1.8;
            margin: 0;
            color: #2c3e50;
        }
        .content h1, .content h2, .content h3 {
            color: #2c3e50;
            margin-top: 25px;
            margin-bottom: 15px;
            font-weight: bold;
            border-bottom: 2px solid #667eea;
            padding-bottom: 8px;
        }
        .content h1 { 
            font-size: 20px; 
            color: #667eea;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        .content h2 { 
            font-size: 18px; 
            color: #2c3e50;
            border-bottom: 1px solid #667eea;
        }
        .content h3 { 
            font-size: 16px; 
            color: #2c3e50;
            font-weight: 600;
        }
        .content ul, .content ol {
            margin: 10px 0;
            padding-left: 20px;
        }
        .content li {
            margin: 8px 0;
            line-height: 1.6;
        }
        .content strong {
            font-weight: bold;
            color: #2c3e50;
            background: linear-gradient(135deg, #667eea, #764ba2);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        .content em {
            font-style: italic;
            color: #555;
        }
        .content p {
            margin: 12px 0;
            line-height: 1.7;
        }
        .footer {
            margin-top: 30px;
            text-align: center;
            color: #666;
            font-size: 12px;
            border-top: 1px solid #eee;
            padding-top: 20px;
        }
        .content .lesson-section {
            background: #ffffff;
            border: 1px solid #e1e5e9;
            border-radius: 8px;
            padding: 20px;
            margin: 15px 0;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .content .highlight-box {
            background: linear-gradient(135deg, #f8f9ff 0%, #e8f2ff 100%);
            border-left: 4px solid #667eea;
            padding: 15px;
            margin: 15px 0;
            border-radius: 0 8px 8px 0;
        }
        
        @media print {
            body { 
                margin: 0; 
                padding: 15px; 
                font-size: 12px;
            }
            .header { 
                page-break-inside: avoid; 
                margin-bottom: 20px;
            }
            .content { 
                page-break-inside: avoid; 
            }
            .content h1, .content h2, .content h3 {
                page-break-after: avoid;
            }
            .content .lesson-section {
                page-break-inside: avoid;
                margin: 10px 0;
            }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>${title}</h1>
        <div class="subtitle">
            ${subject} • Grade ${grade} • ${duration} minutes
        </div>
    </div>
    
    <div class="content">
        ${parseContentToStructuredHTML(content)}
    </div>
    
    <div class="footer">
        <p>Generated by ElimuNova AI • ${new Date().toLocaleDateString()}</p>
    </div>
</body>
</html>
  `
}

function generateWordHTMLContent(content: string, title: string, subject: string, grade: string, topic: string, duration: number): string {
  // Parse content to extract structured information
  const structuredContent = parseContentToStructuredHTML(content)
  
  return `
<html xmlns:o="urn:schemas-microsoft-com:office:office"
      xmlns:w="urn:schemas-microsoft-com:office:word"
      xmlns="http://www.w3.org/TR/REC-html40">
<head>
    <meta charset="UTF-8">
    <meta name="ProgId" content="Word.Document">
    <meta name="Generator" content="Microsoft Word 15">
    <meta name="Originator" content="Microsoft Word 15">
    <title>${title}</title>
    <!--[if gte mso 9]>
    <xml>
        <w:WordDocument>
            <w:View>Print</w:View>
            <w:Zoom>90</w:Zoom>
            <w:DoNotOptimizeForBrowser/>
        </w:WordDocument>
    </xml>
    <![endif]-->
    <style>
        body {
            font-family: 'Calibri', 'Arial', sans-serif;
            font-size: 11pt;
            line-height: 1.4;
            color: #000000;
            margin: 1in;
            background: white;
        }
        .header {
            text-align: center;
            margin-bottom: 30pt;
            border-bottom: 3pt solid #2F5496;
            padding-bottom: 15pt;
        }
        .header h1 {
            font-size: 24pt;
            font-weight: bold;
            color: #2F5496;
            margin: 0 0 10pt 0;
            text-transform: uppercase;
            letter-spacing: 1pt;
        }
        .header .subtitle {
            font-size: 14pt;
            color: #404040;
            margin-top: 10pt;
        }
        .header .subtitle strong {
            color: #2F5496;
            font-weight: bold;
        }
        .lesson-info {
            background: #F2F2F2;
            border: 1pt solid #D0D0D0;
            border-radius: 5pt;
            padding: 15pt;
            margin: 20pt 0;
        }
        .lesson-info h3 {
            margin-top: 0;
            color: #2F5496;
            font-size: 14pt;
            font-weight: bold;
        }
        .lesson-info p {
            margin: 5pt 0;
            font-size: 11pt;
        }
        .content {
            font-size: 11pt;
            line-height: 1.4;
        }
        .content h1 {
            font-size: 18pt;
            font-weight: bold;
            color: #2F5496;
            margin: 25pt 0 15pt 0;
            border-bottom: 2pt solid #4472C4;
            padding-bottom: 5pt;
            text-transform: uppercase;
            letter-spacing: 0.5pt;
        }
        .content h2 {
            font-size: 16pt;
            font-weight: bold;
            color: #404040;
            margin: 20pt 0 10pt 0;
            border-left: 4pt solid #4472C4;
            padding-left: 10pt;
        }
        .content h3 {
            font-size: 14pt;
            font-weight: bold;
            color: #404040;
            margin: 15pt 0 8pt 0;
        }
        .content h4 {
            font-size: 12pt;
            font-weight: bold;
            color: #2F5496;
            margin: 12pt 0 6pt 0;
        }
        .content p {
            margin: 8pt 0;
            text-align: justify;
        }
        .content ul, .content ol {
            margin: 10pt 0;
            padding-left: 20pt;
        }
        .content li {
            margin: 4pt 0;
            line-height: 1.4;
        }
        .content strong {
            font-weight: bold;
            color: #2F5496;
        }
        .content em {
            font-style: italic;
            color: #404040;
        }
        .content pre {
            white-space: pre-wrap;
            font-family: 'Calibri', 'Arial', sans-serif;
            margin: 0;
            background: #F8F9FA;
            padding: 12pt;
            border-left: 4pt solid #4472C4;
            border-radius: 3pt;
            font-size: 10pt;
        }
        .footer {
            margin-top: 30pt;
            text-align: center;
            font-size: 9pt;
            color: #666666;
            border-top: 1pt solid #CCCCCC;
            padding-top: 12pt;
        }
        .page-break {
            page-break-before: always;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Lesson Plan</h1>
        <div class="subtitle">
            <strong>Subject:</strong> ${subject} | 
            <strong>Grade:</strong> ${grade} | 
            <strong>Topic:</strong> ${topic} | 
            <strong>Duration:</strong> ${duration} minutes
        </div>
    </div>
    
    <div class="lesson-info">
        <h3>Lesson Overview</h3>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Grade Level:</strong> ${grade}</p>
        <p><strong>Topic:</strong> ${topic}</p>
        <p><strong>Duration:</strong> ${duration} minutes</p>
        <p><strong>Date Created:</strong> ${new Date().toLocaleDateString()}</p>
    </div>
    
    <div class="content">
        ${structuredContent}
    </div>
    
    <div class="footer">
        <p>Generated by ElimuNova AI - Professional Lesson Planning Platform</p>
        <p>Created on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
    </div>
</body>
</html>
  `
}

function parseContentToStructuredHTML(content: string): string {
  const lines = content.split('\n').filter(line => line.trim())
  let html = ''
  let inList = false
  let listType = ''
  let inSection = false
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    
    if (!line) {
      if (inList) {
        html += `</${listType}>\n`
        inList = false
      }
      if (inSection) {
        html += '</div>\n'
        inSection = false
      }
      html += '<br>\n'
      continue
    }
    
    // Check for main headings (usually numbered or in caps, or with ** markers)
    if (line.match(/^\d+\.?\s+[A-Z][A-Z\s]+$/) || 
        line.match(/^[A-Z][A-Z\s]{10,}$/) ||
        line.match(/^(LESSON|OBJECTIVES|MATERIALS|ACTIVITIES|ASSESSMENT|HOMEWORK|NOTES|INTRODUCTION|CONCLUSION|EVALUATION|PROCEDURE|CLOSURE|REFLECTION|TIME|DURATION|RESOURCES)/i) ||
        line.match(/^\*\*.*\*\*$/) ||
        line.match(/^\d+\.\s+\*\*.*\*\*$/)) {
      
      if (inList) {
        html += `</${listType}>\n`
        inList = false
      }
      if (inSection) {
        html += '</div>\n'
      }
      
      let headingText = line.replace(/^\d+\.?\s*/, '').trim()
      // Remove ** markers from headings
      headingText = headingText.replace(/^\*\*|\*\*$/g, '')
      html += `<div class="lesson-section"><h1>${headingText}</h1>\n`
      inSection = true
    }
    // Check for subheadings
    else if (line.match(/^[A-Z][a-z\s]+:$/) || 
             line.match(/^\d+\.\d+\.?\s+[A-Z]/) ||
             line.match(/^[A-Z][a-z\s]{5,}:/) ||
             line.match(/^(Learning|Teaching|Student|Teacher|Assessment|Activity|Material|Objective|Goal|Outcome)/i)) {
      
      if (inList) {
        html += `</${listType}>\n`
        inList = false
      }
      
      const headingText = line.replace(/^\d+\.\d+\.?\s*/, '').replace(':', '').trim()
      html += `<h2>${headingText}</h2>\n`
    }
    // Check for bullet points or numbered lists
    else if (line.match(/^[-•*]\s/) || line.match(/^\d+\.\s/)) {
      const listTag = line.match(/^\d+\.\s/) ? 'ol' : 'ul'
      
      if (!inList || listType !== listTag) {
        if (inList) {
          html += `</${listType}>\n`
        }
        html += `<${listTag}>\n`
        inList = true
        listType = listTag
      }
      
      let itemText = line.replace(/^[-•*]\s/, '').replace(/^\d+\.\s/, '').trim()
      
      // Apply formatting to list items too
      itemText = itemText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      itemText = itemText.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '<em>$1</em>')
      
      // Clean up any remaining standalone asterisks in list items
      itemText = itemText.replace(/(?<!\*)\*(?!\*)(?![^*]*\*)/g, '')
      
      // Make certain keywords bold in list items
      const keywords = ['Objective', 'Objectives', 'Materials', 'Activity', 'Activities', 'Assessment', 'Homework', 'Notes', 'Duration', 'Grade', 'Subject', 'Topic', 'Learning', 'Teaching', 'Student', 'Teacher', 'Goal', 'Outcome', 'Introduction', 'Conclusion', 'Evaluation', 'Lesson', 'Time', 'Resources', 'Procedure', 'Evaluation', 'Closure', 'Reflection']
      keywords.forEach(keyword => {
        const regex = new RegExp(`\\b(${keyword})\\b`, 'gi')
        itemText = itemText.replace(regex, '<strong>$1</strong>')
      })
      
      html += `<li>${itemText}</li>\n`
    }
    // Regular paragraphs
    else {
      if (inList) {
        html += `</${listType}>\n`
        inList = false
      }
      
      // Check if line contains bold text (text between ** or in caps)
      let formattedLine = line
      
      // Handle bold text with ** markers
      formattedLine = formattedLine.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      
      // Handle italic text with * markers (but not **)
      formattedLine = formattedLine.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '<em>$1</em>')
      
      // Handle single asterisks at the beginning of lines (common in lesson plans)
      if (formattedLine.match(/^\*\s/)) {
        formattedLine = formattedLine.replace(/^\*\s/, '<strong>•</strong> ')
      }
      
      // Clean up any remaining standalone asterisks that weren't caught
      formattedLine = formattedLine.replace(/(?<!\*)\*(?!\*)(?![^*]*\*)/g, '')
      
      // Make certain keywords bold
      const keywords = ['Objective', 'Objectives', 'Materials', 'Activity', 'Activities', 'Assessment', 'Homework', 'Notes', 'Duration', 'Grade', 'Subject', 'Topic', 'Learning', 'Teaching', 'Student', 'Teacher', 'Goal', 'Outcome', 'Introduction', 'Conclusion', 'Evaluation', 'Lesson', 'Time', 'Resources', 'Procedure', 'Evaluation', 'Closure', 'Reflection']
      keywords.forEach(keyword => {
        const regex = new RegExp(`\\b(${keyword})\\b`, 'gi')
        formattedLine = formattedLine.replace(regex, '<strong>$1</strong>')
      })
      
      html += `<p>${formattedLine}</p>\n`
    }
  }
  
  if (inList) {
    html += `</${listType}>\n`
  }
  if (inSection) {
    html += '</div>\n'
  }
  
  return html
}
