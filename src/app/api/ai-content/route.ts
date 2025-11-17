import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
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

    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');
    const search = searchParams.get('search');

    // Build where clause
    const where: any = {
      teacherId: teacher.id
    };

    if (type && type !== 'all') {
      where.type = type.toUpperCase();
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { topic: { contains: search, mode: 'insensitive' } },
        { subject: { contains: search, mode: 'insensitive' } }
      ];
    }

    const content = await prisma.aIGeneratedContent.findMany({
      where,
      include: {
        _count: {
          select: {
            sharedWithStudents: true,
            sharedWithClasses: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({
      success: true,
      content
    });

  } catch (error) {
    console.error('Error fetching AI content:', error);
    return NextResponse.json(
      { error: 'Failed to fetch AI content' },
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

    const { title, content, type, subject, grade, topic, metadata } = await req.json();

    if (!title || !content || !type || !subject || !grade || !topic) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const aiContent = await prisma.aIGeneratedContent.create({
      data: {
        title,
        content,
        type: type.toUpperCase(),
        subject,
        grade,
        topic,
        metadata: metadata || {},
        teacherId: teacher.id
      },
      include: {
        _count: {
          select: {
            sharedWithStudents: true,
            sharedWithClasses: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      content: aiContent
    });

  } catch (error) {
    console.error('Error creating AI content:', error);
    return NextResponse.json(
      { error: 'Failed to create AI content' },
      { status: 500 }
    );
  }
}
