import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb/client'
import { ObjectId } from 'mongodb'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const db = await getDb()

    const categories = await db
      .collection('categories')
      .find({})
      .sort({ sort_order: 1 })
      .toArray()

    const items = await db
      .collection('menu_items')
      .find({})
      .sort({ sort_order: 1 })
      .toArray()

    return NextResponse.json({
      categories: categories.map(c => ({
        id: c._id.toString(),
        slug: c.slug,
        name_en: c.name_en,
        name_mr: c.name_mr,
        sort_order: c.sort_order,
        icon: c.icon,
      })),
      items: items.map(i => ({
        id: i._id.toString(),
        name_en: i.name_en,
        name_mr: i.name_mr,
        category_slug: i.category_slug,
        category_name: i.category_name,
        price: i.price,
        is_veg: i.is_veg ?? true,
        is_available: i.is_available ?? true,
        image_url: i.image_url,
        sort_order: i.sort_order,
      })),
    })
  } catch (error: any) {
    console.error('Error fetching menu:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, is_available, price } = body

    if (!id) {
      return NextResponse.json({ error: 'Item ID is required' }, { status: 400 })
    }

    const updateFields: any = {}
    if (typeof is_available === 'boolean') updateFields.is_available = is_available
    if (typeof price === 'number') updateFields.price = price

    const db = await getDb()
    const result = await db.collection('menu_items').updateOne(
      { _id: new ObjectId(id) },
      { $set: updateFields }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, updated: updateFields })
  } catch (error: any) {
    console.error('Error updating menu item:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
