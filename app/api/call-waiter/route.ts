import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb/client'
import { ObjectId } from 'mongodb'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { table_number } = await request.json()

    if (!table_number) {
      return NextResponse.json(
        { error: 'टेबल क्रमांक आवश्यक आहे' },
        { status: 400 }
      )
    }

    const db = await getDb()

    // Check if there is already an active pending call for this table
    const existing = await db.collection('waiter_calls').findOne({
      table_number: Number(table_number),
      status: 'pending',
    })

    if (existing) {
      return NextResponse.json({
        success: true,
        message: 'वेटरला आधीच बोलावले आहे. वेटर लवकरच येत आहेत!',
        call_id: existing._id.toString(),
      })
    }

    const callDoc = {
      table_number: Number(table_number),
      status: 'pending',
      created_at: new Date(),
    }

    const result = await db.collection('waiter_calls').insertOne(callDoc)

    return NextResponse.json({
      success: true,
      message: 'वेटरला कॉल पाठवला आहे. वेटर येत आहेत!',
      call_id: result.insertedId.toString(),
    })
  } catch (error: any) {
    console.error('Error calling waiter:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function GET() {
  try {
    const db = await getDb()
    const calls = await db
      .collection('waiter_calls')
      .find({ status: 'pending' })
      .sort({ created_at: -1 })
      .toArray()

    return NextResponse.json({
      calls: calls.map(c => ({
        id: c._id.toString(),
        table_number: c.table_number,
        created_at: c.created_at,
      })),
    })
  } catch (error: any) {
    console.error('Error fetching waiter calls:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { call_id } = await request.json()
    if (!call_id) {
      return NextResponse.json({ error: 'Call ID required' }, { status: 400 })
    }

    const db = await getDb()
    await db.collection('waiter_calls').updateOne(
      { _id: new ObjectId(call_id) },
      { $set: { status: 'resolved', resolved_at: new Date() } }
    )

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error resolving waiter call:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
