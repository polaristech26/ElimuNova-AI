import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { AIContentType } from '@prisma/client';

export async function GET(req: NextRequest) {
  try {
    console.log('Rubrics API: GET request received');
    
    const session = await getServerSession(authOptions);
    console.log('Rubrics API: Session check', { hasSession: !!session, userId: session?.user?.id });
    
    if (!session?.user?.id) {
      console.log('Rubrics API: Unauthorized - no session');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get teacher information
    console.log('Rubrics API: Looking up teacher for user', session.user.id);
    const teacher = await prisma.teacher.findFirst({
      where: { userId: session.user.id }
    });

    if (!teacher) {
      console.log('Rubrics API: Teacher not found for user', session.user.id);
      return NextResponse.json({ error: 'Teacher not found' }, { status: 404 });
    }
    
    console.log('Rubrics API: Found teacher', teacher.id);

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search');
    const subject = searchParams.get('subject');
    const grade = searchParams.get('grade');

    // Build where clause
    const where: any = {
      teacherId: teacher.id
    };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { subject: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (subject && subject !== 'all') {
      where.subject = subject;
    }

    if (grade && grade !== 'all') {
      where.grade = grade;
    }

    console.log('Rubrics API: Query where clause', where);

    // Fetch rubrics
    console.log('Rubrics API: Executing database query...');
    const rubrics = await prisma.aIGeneratedContent.findMany({
      where: {
        ...where,
        type: AIContentType.RUBRIC
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    console.log('Rubrics API: Found rubrics', rubrics.length);

    return NextResponse.json({
      success: true,
      rubrics
    });

  } catch (error) {
    console.error('Error fetching rubrics:', error);
    console.error('Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace'
    });
    return NextResponse.json(
      { error: 'Failed to fetch rubrics' },
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
      totalPoints, 
      performanceLevels, 
      criteria, 
      metadata 
    } = await req.json();

    if (!title || !subject || !grade || !criteria || criteria.length === 0) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Create rubric content as JSON
    const rubricContent = {
      title,
      description: description || '',
      subject,
      grade,
      totalPoints: totalPoints || 100,
      performanceLevels: performanceLevels || [],
      criteria: criteria || [],
      metadata: metadata || {}
    };

    const rubric = await prisma.aIGeneratedContent.create({
      data: {
        title,
        content: JSON.stringify(rubricContent),
        type: AIContentType.RUBRIC,
        subject,
        grade,
        topic: title,
        metadata: {
          totalPoints,
          performanceLevels,
          criteria,
          ...metadata
        },
        teacherId: teacher.id
      }
    });

    return NextResponse.json({
      success: true,
      rubric
    });

  } catch (error) {
    console.error('Error creating rubric:', error);
    return NextResponse.json(
      { error: 'Failed to create rubric' },
      { status: 500 }
    );
  }
}
