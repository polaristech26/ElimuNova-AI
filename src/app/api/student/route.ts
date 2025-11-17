import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    console.log('Student API: GET request received');
    
    const session = await getServerSession(authOptions);
    console.log('Student API: Session check', { hasSession: !!session, userId: session?.user?.id, role: session?.user?.role });
    
    if (!session?.user?.id) {
      console.log('Student API: Unauthorized - no session');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get teacher information
    console.log('Student API: Looking up teacher for user', session.user.id);
    const teacher = await prisma.teacher.findFirst({
      where: { userId: session.user.id }
    });

    if (!teacher) {
      console.log('Student API: Teacher not found for user', session.user.id);
      return NextResponse.json({ error: 'Teacher not found' }, { status: 404 });
    }

    console.log('Student API: Found teacher', teacher.id);

    // Fetch students for this teacher
    console.log('Student API: Fetching students for teacher', teacher.id);
    const students = await prisma.student.findMany({
      where: { teacherId: teacher.id },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        },
        class: {
          select: {
            id: true,
            name: true,
            grade: true
          }
        }
      },
      orderBy: {
        id: 'desc'
      }
    });

    console.log('Student API: Found students', students.length);

    const formattedStudents = students.map(student => ({
      id: student.id,
      user: student.user,
      class: student.class
    }));

    return NextResponse.json({
      success: true,
      students: formattedStudents
    });

  } catch (error) {
    console.error('Student API: Error fetching students:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch students',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
