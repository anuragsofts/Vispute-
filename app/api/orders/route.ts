import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb/client'
import { ObjectId } from 'mongodb'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { table_number, items, placed_by = 'customer' } = body

    if (!table_number || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'टेबल क्रमांक आणि वस्तू आवश्यक आहेत' },
        { status: 400 }
      )
    }

    const db = await getDb()

    // 1. Find or create an open session for this table
    let session = await db.collection('table_sessions').findOne({
      table_number: Number(table_number),
      status: 'open',
    })

    if (!session) {
      const newSession = {
        table_number: Number(table_number),
        status: 'open',
        opened_at: new Date(),
        closed_at: null,
      }
      const sessionResult = await db
        .collection('table_sessions')
        .insertOne(newSession)
      session = { ...newSession, _id: sessionResult.insertedId }
    }

    // 2. Calculate total and format order items
    let orderTotal = 0
    const orderItems = items.map((i: any) => {
      const price = Number(i.price_snapshot || i.price || 0)
      const qty = Math.max(1, Number(i.qty || 1))
      orderTotal += price * qty
      return {
        item_id: i.item_id ? String(i.item_id) : '',
        name_snapshot: i.name_snapshot || i.name_mr || i.name || 'आयटम',
        name_en: i.name_en || '',
        price_snapshot: price,
        qty,
        note: i.note ? String(i.note).trim() : '',
      }
    })

    // 3. Count existing orders in this session to determine if this is first or add-on
    const existingOrdersCount = await db.collection('orders').countDocuments({
      session_id: session._id.toString(),
    })

    const is_addon = existingOrdersCount > 0

    // 4. Insert the new order
    const orderDoc = {
      session_id: session._id.toString(),
      table_number: Number(table_number),
      placed_by: placed_by === 'waiter' ? 'waiter' : 'customer',
      status: 'new', // new -> preparing -> ready -> served
      is_addon,
      items: orderItems,
      total: orderTotal,
      created_at: new Date(),
      updated_at: new Date(),
    }

    const orderResult = await db.collection('orders').insertOne(orderDoc)

    return NextResponse.json({
      success: true,
      order_id: orderResult.insertedId.toString(),
      session_id: session._id.toString(),
      table_number: Number(table_number),
      is_addon,
    })
  } catch (error: any) {
    console.error('Error placing order:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')
    const tableNumber = searchParams.get('tableNumber')
    const kitchen = searchParams.get('kitchen')
    const waiter = searchParams.get('waiter')

    const db = await getDb()
    const query: any = {}

    if (sessionId) {
      query.session_id = sessionId
    } else if (tableNumber) {
      query.table_number = Number(tableNumber)
    }

    if (kitchen === 'true') {
      // Kitchen wants orders that are active (new, preparing, ready)
      query.status = { $in: ['new', 'preparing', 'ready'] }
    } else if (waiter === 'true') {
      // Waiter cares about ready orders to serve
      query.status = 'ready'
    }

    const orders = await db
      .collection('orders')
      .find(query)
      .sort({ created_at: -1 })
      .toArray()

    return NextResponse.json({
      orders: orders.map(o => ({
        id: o._id.toString(),
        session_id: o.session_id,
        table_number: o.table_number,
        placed_by: o.placed_by,
        status: o.status,
        is_addon: o.is_addon ?? false,
        items: o.items,
        total: o.total,
        created_at: o.created_at,
        updated_at: o.updated_at,
      })),
    })
  } catch (error: any) {
    console.error('Error fetching orders:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { order_id, status } = body

    if (!order_id || !status) {
      return NextResponse.json(
        { error: 'Order ID and status are required' },
        { status: 400 }
      )
    }

    const allowedStatuses = ['new', 'preparing', 'ready', 'served']
    if (!allowedStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'अवैध ऑर्डर स्थिती' },
        { status: 400 }
      )
    }

    const db = await getDb()
    const result = await db.collection('orders').updateOne(
      { _id: new ObjectId(order_id) },
      {
        $set: {
          status,
          updated_at: new Date(),
        },
      }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, status })
  } catch (error: any) {
    console.error('Error updating order:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
