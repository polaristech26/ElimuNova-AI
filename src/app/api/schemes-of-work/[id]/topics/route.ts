import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET - Get all topics for a scheme of work
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;

    // Verify scheme of work belongs to teacher
    const schemeOfWork = await prisma.schemeOfWork.findFirst({
      where: {
        id,
        teacherId: teacher.id
      }
    });

    if (!schemeOfWork) {
      return NextResponse.json({ error: 'Scheme of work not found' }, { status: 404 });
    }

    // Get topics
    const topics = await prisma.schemeTopic.findMany({
      where: { schemeOfWorkId: id },
      orderBy: [
        { weekNumber: 'asc' },
        { lessonNumber: 'asc' }
      ]
    });

    return NextResponse.json({ topics });

  } catch (error) {
    console.error('Error fetching topics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch topics' },
      { status: 500 }
    );
  }
}

// POST - Create a new topic
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    const body = await req.json();
    const { title, description, weekNumber, lessonNumber, objectives, activities, resources, assessment, duration } = body;

    if (!title || !weekNumber || !lessonNumber) {
      return NextResponse.json(
        { error: 'Title, week number, and lesson number are required' },
        { status: 400 }
      );
    }

    // Verify scheme of work belongs to teacher
    const schemeOfWork = await prisma.schemeOfWork.findFirst({
      where: {
        id,
        teacherId: teacher.id
      }
    });

    if (!schemeOfWork) {
      return NextResponse.json({ error: 'Scheme of work not found' }, { status: 404 });
    }

    // Create topic
    const topic = await prisma.schemeTopic.create({
      data: {
        title,
        description: description || null,
        weekNumber: parseInt(weekNumber),
        lessonNumber: parseInt(lessonNumber),
        objectives: objectives || [],
        activities: activities || [],
        resources: resources || [],
        assessment: assessment || null,
        duration: duration || 40,
        schemeOfWorkId: id
      }
    });

    return NextResponse.json(topic, { status: 201 });

  } catch (error) {
    console.error('Error creating topic:', error);
    return NextResponse.json(
      { error: 'Failed to create topic' },
      { status: 500 }
    );
  }
}
