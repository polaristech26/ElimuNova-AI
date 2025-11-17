import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

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
    const schemeOfWork = await prisma.schemeOfWork.findFirst({
      where: {
        id,
        teacherId: teacher.id
      },
      include: {
        lessonPlans: {
          select: {
            id: true,
            title: true,
            createdAt: true
          }
        },
        _count: {
          select: { lessonPlans: true }
        }
      }
    });

    if (!schemeOfWork) {
      return NextResponse.json({ error: 'Scheme of work not found' }, { status: 404 });
    }

    // Parse content
    const parsedSchemeOfWork = {
      ...schemeOfWork,
      content: schemeOfWork.content ? JSON.parse(schemeOfWork.content) : null
    };

    return NextResponse.json(parsedSchemeOfWork);

  } catch (error) {
    console.error('Error fetching scheme of work:', error);
    return NextResponse.json(
      { error: 'Failed to fetch scheme of work' },
      { status: 500 }
    );
  }
}

export async function PUT(
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
    const { title, subject, grade, term, content, duration, objectives, topics } = body;

    // Check if scheme of work exists and belongs to teacher
    const existingSchemeOfWork = await prisma.schemeOfWork.findFirst({
      where: {
        id,
        teacherId: teacher.id
      }
    });

    if (!existingSchemeOfWork) {
      return NextResponse.json({ error: 'Scheme of work not found' }, { status: 404 });
    }

    // Update scheme of work with topics
    const updatedSchemeOfWork = await prisma.schemeOfWork.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(subject && { subject }),
        ...(grade && { grade }),
        ...(term && { term }),
        ...(content && { content: JSON.stringify(content) }),
        ...(duration !== undefined && { duration }),
        ...(objectives !== undefined && { objectives }),
        // Note: Topics update will be handled separately due to Prisma client limitations
        // ...(topics && {
        //   topics: {
        //     deleteMany: {}, // Delete existing topics
        //     create: topics.map((topic: any) => ({
        //       title: topic.title,
        //       description: topic.description || null,
        //       weekNumber: topic.weekNumber,
        //       lessonNumber: topic.lessonNumber,
        //       objectives: topic.objectives || [],
        //       activities: topic.activities || [],
        //       resources: topic.resources || [],
        //       assessment: topic.assessment || null,
        //       duration: topic.duration || 40
        //     }))
        //   }
        // })
      },
      include: {
        lessonPlans: {
          select: {
            id: true,
            title: true,
            createdAt: true
          }
        },
        _count: {
          select: { lessonPlans: true }
        }
      }
    });

    // Parse content
    const parsedSchemeOfWork = {
      ...updatedSchemeOfWork,
      content: updatedSchemeOfWork.content ? JSON.parse(updatedSchemeOfWork.content) : null
    };

    return NextResponse.json(parsedSchemeOfWork);

  } catch (error) {
    console.error('Error updating scheme of work:', error);
    return NextResponse.json(
      { error: 'Failed to update scheme of work' },
      { status: 500 }
    );
  }
}

export async function DELETE(
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
    
    // Check if scheme of work exists and belongs to teacher
    const existingSchemeOfWork = await prisma.schemeOfWork.findFirst({
      where: {
        id,
        teacherId: teacher.id
      }
    });

    if (!existingSchemeOfWork) {
      return NextResponse.json({ error: 'Scheme of work not found' }, { status: 404 });
    }

    // Delete scheme of work
    await prisma.schemeOfWork.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Scheme of work deleted successfully' });

  } catch (error) {
    console.error('Error deleting scheme of work:', error);
    return NextResponse.json(
      { error: 'Failed to delete scheme of work' },
      { status: 500 }
    );
  }
}
