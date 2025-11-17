import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId') || session.user.id

    let preferences = await prisma.userPreference.findUnique({
      where: { userId }
    })

    // Create default preferences if none exist
    if (!preferences) {
      preferences = await prisma.userPreference.create({
        data: {
          userId,
          theme: 'light',
          language: 'en',
          timezone: 'UTC',
          emailNotifications: true,
          pushNotifications: true
        }
      })
    }

    return NextResponse.json(preferences)
  } catch (error) {
    console.error('Error fetching user preferences:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { userId, theme, language, timezone, emailNotifications, pushNotifications } = body

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    const preferences = await prisma.userPreference.upsert({
      where: { userId },
      update: {
        theme,
        language,
        timezone,
        emailNotifications,
        pushNotifications
      },
      create: {
        userId,
        theme: theme || 'light',
        language: language || 'en',
        timezone: timezone || 'UTC',
        emailNotifications: emailNotifications !== undefined ? emailNotifications : true,
        pushNotifications: pushNotifications !== undefined ? pushNotifications : true
      }
    })

    return NextResponse.json(preferences)
  } catch (error) {
    console.error('Error saving user preferences:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
