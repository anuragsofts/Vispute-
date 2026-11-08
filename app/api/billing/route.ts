import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb/client'
import { ObjectId } from 'mongodb'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const db = await getDb()

    // 1. Get all open sessions
    const openSessions = await db
      .collection('table_sessions')
      .find({ status: 'open' })
      .sort({ table_number: 1 })
      .toArray()

    const results = []

    for (const session of openSessions) {
      // Find all orders for this session
      const orders = await db
        .collection('orders')
        .find({ session_id: session._id.toString() })
        .sort({ created_at: 1 })
        .toArray()

      // Aggregate items across all orders in this session
      const itemMap = new Map<string, { name: string; name_en: string; price: number; qty: number; total: number }>()
      let subtotal = 0

      for (const order of orders) {
        if (Array.isArray(order.items)) {
          for (const item of order.items) {
            const key = `${item.name_snapshot}_${item.price_snapshot}`
            const existing = itemMap.get(key)
            if (existing) {
              existing.qty += item.qty
              existing.total += item.price_snapshot * item.qty
            } else {
              itemMap.set(key, {
                name: item.name_snapshot,
                name_en: item.name_en || '',
                price: item.price_snapshot,
                qty: item.qty,
                total: item.price_snapshot * item.qty,
              })
            }
            subtotal += item.price_snapshot * item.qty
          }
        }
      }

      const items = Array.from(itemMap.values())
      const gst = Math.round(subtotal * 0.05 * 100) / 100 // 5% GST
      const grandTotal = Math.round(subtotal + gst)

      results.push({
        session_id: session._id.toString(),
        table_number: session.table_number,
        opened_at: session.opened_at,
        orders_count: orders.length,
        items,
        subtotal,
        gst,
        grandTotal,
      })
    }

    return NextResponse.json({ openSessions: results })
  } catch (error: any) {
    console.error('Error fetching billing sessions:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      session_id,
      table_number,
      customer_mobile,
      customer_name = '',
      offers_consent = false,
      discount = 0,
      payment_mode = 'cash',
    } = body

    // 1. Mandatory 10-digit mobile number validation
    const cleanMobile = String(customer_mobile || '').trim().replace(/\D/g, '')
    if (!/^[6-9]\d{9}$/.test(cleanMobile)) {
      return NextResponse.json(
        { error: 'वैध १०-अंकी भारतीय मोबाईल नंबर आवश्यक आहे (उदा. 9822012345)' },
        { status: 400 }
      )
    }

    if (!session_id) {
      return NextResponse.json({ error: 'Session ID required' }, { status: 400 })
    }

    const db = await getDb()

    // 2. Fetch session and all orders
    const session = await db
      .collection('table_sessions')
      .findOne({ _id: new ObjectId(session_id) })

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    const orders = await db
      .collection('orders')
      .find({ session_id })
      .toArray()

    // 3. Compute item totals
    let subtotal = 0
    const billItems: any[] = []

    for (const order of orders) {
      if (Array.isArray(order.items)) {
        for (const item of order.items) {
          subtotal += item.price_snapshot * item.qty
          billItems.push({
            name: item.name_snapshot,
            name_en: item.name_en || '',
            price: item.price_snapshot,
            qty: item.qty,
            total: item.price_snapshot * item.qty,
          })
        }
      }
    }

    const discountAmount = Math.max(0, Number(discount) || 0)
    const discountedSubtotal = Math.max(0, subtotal - discountAmount)
    const gst = Math.round(discountedSubtotal * 0.05 * 100) / 100
    const total = Math.round(discountedSubtotal + gst)

    // 4. Upsert Customer in `customers` collection (with DPDP consent tracking)
    await db.collection('customers').updateOne(
      { mobile: cleanMobile },
      {
        $set: {
          name: customer_name.trim() || undefined,
          offers_consent: Boolean(offers_consent),
          last_visit: new Date(),
        },
        $inc: {
          total_visits: 1,
          total_spent: total,
        },
        $setOnInsert: {
          first_seen: new Date(),
        },
      },
      { upsert: true }
    )

    // 5. Create Bill document
    const billDoc = {
      session_id,
      table_number: Number(table_number || session.table_number),
      customer_mobile: cleanMobile,
      customer_name: customer_name.trim(),
      offers_consent: Boolean(offers_consent),
      items: billItems,
      subtotal,
      discount: discountAmount,
      gst,
      total,
      payment_mode: ['cash', 'upi', 'card'].includes(payment_mode)
        ? payment_mode
        : 'cash',
      paid_at: new Date(),
    }

    const billResult = await db.collection('bills').insertOne(billDoc)

    // 6. Close the table session (frees the table!)
    await db.collection('table_sessions').updateOne(
      { _id: new ObjectId(session_id) },
      {
        $set: {
          status: 'billed',
          closed_at: new Date(),
          bill_id: billResult.insertedId.toString(),
        },
      }
    )

    // Mark all orders in session as served
    await db.collection('orders').updateMany(
      { session_id },
      { $set: { status: 'served', updated_at: new Date() } }
    )

    return NextResponse.json({
      success: true,
      bill: {
        id: billResult.insertedId.toString(),
        ...billDoc,
      },
    })
  } catch (error: any) {
    console.error('Error generating bill:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
