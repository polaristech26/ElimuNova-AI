import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET - Get a specific topic
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; topicId: string }> }
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

    const { id, topicId } = await params;

    // Verify scheme of work belongs to teacher and get topic
    const topic = await prisma.schemeTopic.findFirst({
      where: {
        id: topicId,
        schemeOfWorkId: id,
        schemeOfWork: {
          teacherId: teacher.id
        }
      }
    });

    if (!topic) {
      return NextResponse.json({ error: 'Topic not found' }, { status: 404 });
    }

    return NextResponse.json(topic);

  } catch (error) {
    console.error('Error fetching topic:', error);
    return NextResponse.json(
      { error: 'Failed to fetch topic' },
      { status: 500 }
    );
  }
}

// PUT - Update a topic
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; topicId: string }> }
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

    const { id, topicId } = await params;
    const body = await req.json();
    const { title, description, weekNumber, lessonNumber, objectives, activities, resources, assessment, duration } = body;

    // Verify topic belongs to teacher's scheme of work
    const existingTopic = await prisma.schemeTopic.findFirst({
      where: {
        id: topicId,
        schemeOfWorkId: id,
        schemeOfWork: {
          teacherId: teacher.id
        }
      }
    });

    if (!existingTopic) {
      return NextResponse.json({ error: 'Topic not found' }, { status: 404 });
    }

    // Update topic
    const updatedTopic = await prisma.schemeTopic.update({
      where: { id: topicId },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(weekNumber && { weekNumber: parseInt(weekNumber) }),
        ...(lessonNumber && { lessonNumber: parseInt(lessonNumber) }),
        ...(objectives && { objectives }),
        ...(activities && { activities }),
        ...(resources && { resources }),
        ...(assessment !== undefined && { assessment }),
        ...(duration && { duration: parseInt(duration) })
      }
    });

    return NextResponse.json(updatedTopic);

  } catch (error) {
    console.error('Error updating topic:', error);
    return NextResponse.json(
      { error: 'Failed to update topic' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a topic
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; topicId: string }> }
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

    const { id, topicId } = await params;

    // Verify topic belongs to teacher's scheme of work
    const existingTopic = await prisma.schemeTopic.findFirst({
      where: {
        id: topicId,
        schemeOfWorkId: id,
        schemeOfWork: {
          teacherId: teacher.id
        }
      }
    });

    if (!existingTopic) {
      return NextResponse.json({ error: 'Topic not found' }, { status: 404 });
    }

    // Delete topic
    await prisma.schemeTopic.delete({
      where: { id: topicId }
    });

    return NextResponse.json({ message: 'Topic deleted successfully' });

  } catch (error) {
    console.error('Error deleting topic:', error);
    return NextResponse.json(
      { error: 'Failed to delete topic' },
      { status: 500 }
    );
  }
}
