import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { seedMeetings } from '@/lib/seed-meetings';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only allow in development
    if (process.env.NODE_ENV !== 'development') {
      return NextResponse.json({ error: 'Not allowed in production' }, { status: 403 });
    }

    await seedMeetings();

    return NextResponse.json({ message: 'Meetings seeded successfully' });

  } catch (error) {
    console.error('Error seeding meetings:', error);
    return NextResponse.json(
      { error: 'Failed to seed meetings' },
      { status: 500 }
    );
  }
}
