import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb/client'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const db = await getDb()

    // 1. Total revenue & orders today
    const startOfToday = new Date()
    startOfToday.setHours(0, 0, 0, 0)

    const billsToday = await db
      .collection('bills')
      .find({ paid_at: { $gte: startOfToday } })
      .toArray()

    const todaySales = billsToday.reduce((sum, b) => sum + (b.total || 0), 0)

    // 2. Active open tables
    const activeTables = await db
      .collection('table_sessions')
      .countDocuments({ status: 'open' })

    // 3. Total orders today
    const ordersToday = await db
      .collection('orders')
      .countDocuments({ created_at: { $gte: startOfToday } })

    // 4. Total customers in CRM
    const totalCustomers = await db.collection('customers').countDocuments()

    // 5. Recent 10 bills
    const recentBills = await db
      .collection('bills')
      .find({})
      .sort({ paid_at: -1 })
      .limit(10)
      .toArray()

    return NextResponse.json({
      todaySales,
      activeTables,
      ordersToday,
      totalCustomers,
      recentBills: recentBills.map(b => ({
        id: b._id.toString(),
        table_number: b.table_number,
        customer_mobile: b.customer_mobile,
        total: b.total,
        payment_mode: b.payment_mode,
        paid_at: b.paid_at,
      })),
    })
  } catch (error: any) {
    console.error('Error fetching admin analytics:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
