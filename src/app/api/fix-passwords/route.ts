import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { fixPlainTextPasswords } from '@/lib/fix-passwords';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only allow in development or for super admin
    if (process.env.NODE_ENV !== 'development' && session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Not allowed' }, { status: 403 });
    }

    await fixPlainTextPasswords();

    return NextResponse.json({ message: 'Passwords fixed successfully' });

  } catch (error) {
    console.error('Error fixing passwords:', error);
    return NextResponse.json(
      { error: 'Failed to fix passwords' },
      { status: 500 }
    );
  }
}
