import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({
      message: 'Activities API is working',
      timestamp: new Date().toISOString(),
      status: 'ok'
    })
  } catch (error) {
    console.error('Error in test endpoint:', error)
    return NextResponse.json(
      { error: 'Test endpoint failed' },
      { status: 500 }
    )
  }
}
