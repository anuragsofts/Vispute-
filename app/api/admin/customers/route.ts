import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb/client'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const exportCsv = searchParams.get('export') === 'csv'

    const db = await getDb()
    const customers = await db
      .collection('customers')
      .find({})
      .sort({ last_visit: -1 })
      .toArray()

    if (exportCsv) {
      // Build CSV
      const headers = ['Mobile', 'Name', 'Offers Consent', 'First Seen', 'Last Visit', 'Total Visits', 'Total Spent (Rs)']
      const rows = customers.map(c => [
        `"${c.mobile}"`,
        `"${c.name || ''}"`,
        c.offers_consent ? 'YES' : 'NO',
        `"${new Date(c.first_seen).toLocaleDateString('en-IN')}"`,
        `"${new Date(c.last_visit).toLocaleDateString('en-IN')}"`,
        c.total_visits || 1,
        c.total_spent || 0,
      ])

      const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')

      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': 'attachment; filename="vispute-customers.csv"',
        },
      })
    }

    return NextResponse.json({
      customers: customers.map(c => ({
        id: c._id.toString(),
        mobile: c.mobile,
        name: c.name || '',
        offers_consent: c.offers_consent,
        first_seen: c.first_seen,
        last_visit: c.last_visit,
        total_visits: c.total_visits || 1,
        total_spent: c.total_spent || 0,
      })),
    })
  } catch (error: any) {
    console.error('Error fetching customers:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
