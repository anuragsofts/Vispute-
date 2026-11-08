import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb/client'
import QRCode from 'qrcode'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const db = await getDb()
    const tables = await db
      .collection('tables')
      .find({ is_active: true })
      .sort({ number: 1 })
      .toArray()

    const origin =
      request.nextUrl.origin ||
      process.env.NEXT_PUBLIC_APP_URL ||
      'http://localhost:3000'

    const qrList = await Promise.all(
      tables.map(async t => {
        const url = `${origin}/t/${t.secret_token}`
        const qrDataUrl = await QRCode.toDataURL(url, {
          width: 300,
          margin: 2,
          color: {
            dark: '#1C0A00', // Vispute dark brown
            light: '#FEFCE8', // Vispute warm cream
          },
        })
        return {
          id: t._id.toString(),
          number: t.number,
          secret_token: t.secret_token,
          url,
          qrDataUrl,
        }
      })
    )

    return NextResponse.json({ tables: qrList })
  } catch (error: any) {
    console.error('Error generating QR codes:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
