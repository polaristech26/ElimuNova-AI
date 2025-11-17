import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  try {
    const { email, newPassword } = await req.json();

    console.log('Resetting password for student:', email);

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        student: true
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.role !== 'STUDENT') {
      return NextResponse.json({ error: 'User is not a student' }, { status: 403 });
    }

    if (!user.student) {
      return NextResponse.json({ error: 'Student profile not found' }, { status: 404 });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update the user's password
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword
      }
    });

    console.log('Password reset successfully for:', email);

    return NextResponse.json({
      success: true,
      message: 'Password reset successfully',
      email: user.email,
      name: `${user.firstName} ${user.lastName}`
    });

  } catch (error) {
    console.error('Error resetting password:', error);
    return NextResponse.json({ 
      error: 'Failed to reset password', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
