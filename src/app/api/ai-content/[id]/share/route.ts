import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
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

    const { studentIds, classIds } = await req.json();

    // Check if content exists and belongs to teacher
    const content = await prisma.aIGeneratedContent.findFirst({
      where: {
        id: params.id,
        teacherId: teacher.id
      }
    });

    if (!content) {
      return NextResponse.json({ error: 'Content not found' }, { status: 404 });
    }

    // Share with individual students
    if (studentIds && studentIds.length > 0) {
      await prisma.sharedAIContent.createMany({
        data: studentIds.map((studentId: string) => ({
          contentId: params.id,
          studentId
        })),
        skipDuplicates: true
      });
    }

    // Share with classes
    if (classIds && classIds.length > 0) {
      await prisma.sharedAIContentWithClass.createMany({
        data: classIds.map((classId: string) => ({
          contentId: params.id,
          classId
        })),
        skipDuplicates: true
      });
    }

    // Update content as shared
    await prisma.aIGeneratedContent.update({
      where: { id: params.id },
      data: { isShared: true }
    });

    return NextResponse.json({
      success: true,
      message: 'Content shared successfully'
    });

  } catch (error) {
    console.error('Error sharing AI content:', error);
    return NextResponse.json(
      { error: 'Failed to share AI content' },
      { status: 500 }
    );
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
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

    // Get sharing information for the content
    const content = await prisma.aIGeneratedContent.findFirst({
      where: {
        id: params.id,
        teacherId: teacher.id
      },
      include: {
        sharedWithStudents: {
          include: {
            student: {
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
        },
        sharedWithClasses: {
          include: {
            class: {
              select: {
                id: true,
                name: true,
                grade: true
              }
            }
          }
        }
      }
    });

    if (!content) {
      return NextResponse.json({ error: 'Content not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      sharedWith: {
        students: content.sharedWithStudents.map(s => ({
          id: s.student.id,
          name: `${s.student.user.firstName} ${s.student.user.lastName}`,
          sharedAt: s.sharedAt
        })),
        classes: content.sharedWithClasses.map(c => ({
          id: c.class.id,
          name: c.class.name,
          grade: c.class.grade,
          sharedAt: c.sharedAt
        }))
      }
    });

  } catch (error) {
    console.error('Error fetching sharing info:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sharing info' },
      { status: 500 }
    );
  }
}
