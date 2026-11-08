import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb/client'
import { ObjectId } from 'mongodb'

export const dynamic = 'force-dynamic'

// Add new menu item
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name_mr, name_en, category_slug, category_name, price, image_url, is_veg = true } = body

    if (!name_mr || !price || !category_slug) {
      return NextResponse.json(
        { error: 'नाव, श्रेणी आणि किंमत आवश्यक आहेत' },
        { status: 400 }
      )
    }

    const db = await getDb()
    const itemDoc = {
      name_mr: name_mr.trim(),
      name_en: (name_en || name_mr).trim(),
      category_slug,
      category_name: category_name || category_slug,
      price: parseFloat(price),
      is_veg: Boolean(is_veg),
      is_available: true,
      image_url: image_url || 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=500&auto=format&fit=crop&q=80',
      sort_order: 999,
      created_at: new Date(),
    }

    const result = await db.collection('menu_items').insertOne(itemDoc)
    return NextResponse.json({ success: true, item: { id: result.insertedId.toString(), ...itemDoc } })
  } catch (error: any) {
    console.error('Error adding menu item:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// Delete menu item
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Item ID required' }, { status: 400 })
    }

    const db = await getDb()
    await db.collection('menu_items').deleteOne({ _id: new ObjectId(id) })
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error deleting menu item:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
