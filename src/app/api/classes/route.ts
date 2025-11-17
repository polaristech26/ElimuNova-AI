import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    console.log('Classes API: GET request received');
    
    const session = await getServerSession(authOptions);
    console.log('Classes API: Session check', { hasSession: !!session, userId: session?.user?.id, role: session?.user?.role });
    
    if (!session?.user?.id) {
      console.log('Classes API: Unauthorized - no session');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get teacher information
    console.log('Classes API: Looking up teacher for user', session.user.id);
    const teacher = await prisma.teacher.findFirst({
      where: { userId: session.user.id }
    });

    if (!teacher) {
      console.log('Classes API: Teacher not found for user', session.user.id);
      return NextResponse.json({ error: 'Teacher not found' }, { status: 404 });
    }

    console.log('Classes API: Found teacher', teacher.id);

    // Fetch classes for this teacher
    console.log('Classes API: Fetching classes for teacher', teacher.id);
    const classes = await prisma.class.findMany({
      where: { teacherId: teacher.id },
      select: {
        id: true,
        name: true,
        subject: true,
        grade: true,
        description: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log('Classes API: Found classes', classes.length);

    return NextResponse.json({
      success: true,
      classes: classes
    });

  } catch (error) {
    console.error('Classes API: Error fetching classes:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch classes',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
