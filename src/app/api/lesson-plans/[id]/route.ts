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
    const lessonPlan = await prisma.lessonPlan.findFirst({
      where: {
        id,
        teacherId: teacher.id
      },
      include: {
        schemeOfWork: {
          select: {
            id: true,
            title: true
          }
        }
      }
    });

    if (!lessonPlan) {
      return NextResponse.json({ error: 'Lesson plan not found' }, { status: 404 });
    }

    // Parse content
    const parsedLessonPlan = {
      ...lessonPlan,
      content: lessonPlan.content ? JSON.parse(lessonPlan.content) : null
    };

    return NextResponse.json(parsedLessonPlan);

  } catch (error) {
    console.error('Error fetching lesson plan:', error);
    return NextResponse.json(
      { error: 'Failed to fetch lesson plan' },
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
    const { title, subject, grade, content, schemeOfWorkId } = body;

    // Check if lesson plan exists and belongs to teacher
    const existingLessonPlan = await prisma.lessonPlan.findFirst({
      where: {
        id,
        teacherId: teacher.id
      }
    });

    if (!existingLessonPlan) {
      return NextResponse.json({ error: 'Lesson plan not found' }, { status: 404 });
    }

    // Update lesson plan
    const updatedLessonPlan = await prisma.lessonPlan.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(subject && { subject }),
        ...(grade && { grade }),
        ...(content && { content: JSON.stringify(content) }),
        ...(schemeOfWorkId !== undefined && { schemeOfWorkId: schemeOfWorkId || null })
      },
      include: {
        schemeOfWork: {
          select: {
            id: true,
            title: true
          }
        }
      }
    });

    // Parse content
    const parsedLessonPlan = {
      ...updatedLessonPlan,
      content: updatedLessonPlan.content ? JSON.parse(updatedLessonPlan.content) : null
    };

    return NextResponse.json(parsedLessonPlan);

  } catch (error) {
    console.error('Error updating lesson plan:', error);
    return NextResponse.json(
      { error: 'Failed to update lesson plan' },
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
    // Check if lesson plan exists and belongs to teacher
    const existingLessonPlan = await prisma.lessonPlan.findFirst({
      where: {
        id,
        teacherId: teacher.id
      }
    });

    if (!existingLessonPlan) {
      return NextResponse.json({ error: 'Lesson plan not found' }, { status: 404 });
    }

    // Delete lesson plan
    await prisma.lessonPlan.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Lesson plan deleted successfully' });

  } catch (error) {
    console.error('Error deleting lesson plan:', error);
    return NextResponse.json(
      { error: 'Failed to delete lesson plan' },
      { status: 500 }
    );
  }
}
