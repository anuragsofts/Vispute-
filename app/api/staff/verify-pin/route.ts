import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb/client'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { pin } = await request.json()

    if (!pin) {
      return NextResponse.json({ error: 'PIN आवश्यक आहे' }, { status: 400 })
    }

    const cleanPin = String(pin).trim()
    const db = await getDb()

    const staff = await db.collection('staff').findOne({ pin: cleanPin })

    if (!staff) {
      return NextResponse.json(
        { error: 'अवैध पिन. पुन्हा प्रयत्न करा.' },
        { status: 401 }
      )
    }

    const response = NextResponse.json({
      success: true,
      staff: {
        id: staff._id.toString(),
        name: staff.name,
        role: staff.role,
      },
    })

    // Set cookie so role is saved in browser session
    response.cookies.set('vispute_role', staff.role, {
      path: '/',
      httpOnly: false,
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })
    response.cookies.set('vispute_staff_name', staff.name, {
      path: '/',
      httpOnly: false,
      maxAge: 60 * 60 * 24 * 7,
    })

    return response
  } catch (error: any) {
    console.error('Error verifying PIN:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
