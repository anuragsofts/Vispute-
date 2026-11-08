import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb/client'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params
    const db = await getDb()

    // 1. Find table by secret_token
    const table = await db.collection('tables').findOne({
      secret_token: token,
      is_active: true,
    })

    if (!table) {
      return NextResponse.json(
        { error: 'अवैध किंवा निष्क्रिय टेबल QR कोड' },
        { status: 404 }
      )
    }

    // 2. Find or check for an active open session
    const openSession = await db.collection('table_sessions').findOne({
      table_number: table.number,
      status: 'open',
    })

    return NextResponse.json({
      table: {
        id: table._id.toString(),
        number: table.number,
        secret_token: table.secret_token,
      },
      activeSessionId: openSession ? openSession._id.toString() : null,
    })
  } catch (error: any) {
    console.error('Error fetching table by token:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
