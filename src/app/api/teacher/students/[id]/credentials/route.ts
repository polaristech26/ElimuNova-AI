import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'TEACHER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { password, generatePassword, resetPassword } = body;

    // Get teacher profile
    const teacher = await prisma.teacher.findUnique({
      where: { userId: session.user.id }
    });

    if (!teacher) {
      return NextResponse.json({ error: 'Teacher profile not found' }, { status: 404 });
    }

    // Check if student exists and belongs to teacher
    const student = await prisma.student.findUnique({
      where: { 
        id: id,
        teacherId: teacher.id
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    if (!student) {
      return NextResponse.json({ error: 'Student not found or access denied' }, { status: 404 });
    }

    // Use provided password or generate one
    let finalPassword = password;
    if (generatePassword || resetPassword || !finalPassword) {
      // Generate a more secure random password
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
      let generatedPassword = '';
      for (let i = 0; i < 12; i++) {
        generatedPassword += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      finalPassword = generatedPassword;
    }

    // Validate password strength
    if (finalPassword.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters long' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(finalPassword, 12);

    // Update user with new password
    await prisma.user.update({
      where: { id: student.userId },
      data: {
        password: hashedPassword
      }
    });

    // Store credentials in a way that can be retrieved later
    // For now, we'll return them directly
    const credentials = {
      username: student.user.email, // Use email as username for login
      password: finalPassword
    };

    return NextResponse.json({
      credentials,
      password: finalPassword, // Include the plain password for display
      message: 'Student credentials generated successfully'
    });

  } catch (error) {
    console.error('Error generating student credentials:', error);
    return NextResponse.json({ error: 'Failed to generate credentials' }, { status: 500 });
  }
}
