import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { AIContentType } from '@prisma/client';

export async function GET(req: NextRequest) {
  try {
    console.log('PowerPoint API: GET request received');
    
    const session = await getServerSession(authOptions);
    console.log('PowerPoint API: Session check', { hasSession: !!session, userId: session?.user?.id });
    
    if (!session?.user?.id) {
      console.log('PowerPoint API: Unauthorized - no session');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get teacher information
    console.log('PowerPoint API: Looking up teacher for user', session.user.id);
    const teacher = await prisma.teacher.findFirst({
      where: { userId: session.user.id }
    });

    if (!teacher) {
      console.log('PowerPoint API: Teacher not found for user', session.user.id);
      return NextResponse.json({ error: 'Teacher not found' }, { status: 404 });
    }
    
    console.log('PowerPoint API: Found teacher', teacher.id);

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search');
    const subject = searchParams.get('subject');
    const grade = searchParams.get('grade');

    // Build where clause
    const where: any = {
      teacherId: teacher.id,
      type: AIContentType.POWERPOINT
    };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { topic: { contains: search, mode: 'insensitive' } },
        { subject: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (subject && subject !== 'all') {
      where.subject = subject;
    }

    if (grade && grade !== 'all') {
      where.grade = grade;
    }

    console.log('PowerPoint API: Query where clause', where);

    // Fetch PowerPoint presentations
    console.log('PowerPoint API: Executing database query...');
    const powerpoints = await prisma.aIGeneratedContent.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        teacher: {
          select: {
            id: true,
            user: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          }
        }
      }
    });

    console.log('PowerPoint API: Found presentations', powerpoints.length);

    // Parse content for each PowerPoint
    const parsedPowerpoints = powerpoints.map(ppt => {
      let parsedContent;
      try {
        parsedContent = JSON.parse(ppt.content);
      } catch (error) {
        console.error('PowerPoint API: Error parsing content for PowerPoint', ppt.id, error);
        parsedContent = {
          title: ppt.title,
          slides: [],
          metadata: {}
        };
      }

      return {
        id: ppt.id,
        title: ppt.title,
        subject: ppt.subject,
        grade: ppt.grade,
        topic: ppt.topic,
        content: parsedContent,
        metadata: ppt.metadata,
        isShared: ppt.isShared,
        createdAt: ppt.createdAt,
        updatedAt: ppt.updatedAt,
        teacher: ppt.teacher
      };
    });

    return NextResponse.json({
      success: true,
      powerpoints: parsedPowerpoints
    });

  } catch (error) {
    console.error('PowerPoint API: Error fetching PowerPoint presentations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch PowerPoint presentations' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get teacher information
    const teacher = await prisma.teacher.findFirst({
      where: { userId: session.user.id }
    });

    if (!teacher) {
      return NextResponse.json({ error: 'Teacher not found' }, { status: 404 });
    }

    const { 
      title, 
      description, 
      subject, 
      grade, 
      topic,
      duration,
      slideCount,
      slides, 
      metadata 
    } = await req.json();

    if (!title || !subject || !grade || !topic || !slides || slides.length === 0) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Create PowerPoint content as JSON
    const powerpointContent = {
      title,
      description: description || '',
      subject,
      grade,
      topic,
      duration: duration || 45,
      slideCount: slideCount || 10,
      slides: slides || [],
      metadata: metadata || {}
    };

    const powerpoint = await prisma.aIGeneratedContent.create({
      data: {
        title,
        content: JSON.stringify(powerpointContent),
        type: AIContentType.POWERPOINT,
        subject,
        grade,
        topic,
        metadata: {
          duration,
          slideCount,
          slides,
          ...metadata
        },
        teacherId: teacher.id
      }
    });

    return NextResponse.json({
      success: true,
      powerpoint: {
        id: powerpoint.id,
        title: powerpoint.title,
        subject: powerpoint.subject,
        grade: powerpoint.grade,
        topic: powerpoint.topic,
        content: JSON.parse(powerpoint.content),
        metadata: powerpoint.metadata,
        createdAt: powerpoint.createdAt,
        updatedAt: powerpoint.updatedAt
      }
    });

  } catch (error) {
    console.error('Error creating PowerPoint:', error);
    return NextResponse.json(
      { error: 'Failed to create PowerPoint' },
      { status: 500 }
    );
  }
}
