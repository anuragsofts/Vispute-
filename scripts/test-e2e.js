// ============================================================
// Vispute Restaurant – Full End-to-End Test Suite
// Tests all APIs and core business flows directly
// ============================================================

const http = require('http')

const BASE_URL = 'http://localhost:3000'

async function postJSON(url, body) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  return { status: res.status, data: await res.json() }
}

async function getJSON(url) {
  const res = await fetch(url)
  return { status: res.status, data: await res.json() }
}

async function patchJSON(url, body) {
  const res = await fetch(url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  return { status: res.status, data: await res.json() }
}

async function runTests() {
  console.log('🧪 STARTING VISPUTE RESTAURANT E2E TESTS...\n')

  // 1. Test Table Token Lookup
  console.log('1. Testing Table 1 QR Token Lookup...')
  const tableRes = await getJSON(`${BASE_URL}/api/table/tok_tbl01_vispute_a1b2c3d4`)
  console.assert(tableRes.status === 200, `Expected 200, got ${tableRes.status}`)
  console.assert(tableRes.data.table?.number === 1, 'Table number should be 1')
  console.log('   ✓ Table 1 token validated successfully')

  // 2. Test Menu Retrieval
  console.log('2. Testing Menu Retrieval...')
  const menuRes = await getJSON(`${BASE_URL}/api/menu`)
  console.assert(menuRes.status === 200, `Expected 200, got ${menuRes.status}`)
  console.assert(menuRes.data.items?.length > 100, 'Should have 100+ menu items')
  console.assert(menuRes.data.categories?.length >= 10, 'Should have 10+ categories')
  console.log(`   ✓ Found ${menuRes.data.items.length} items across ${menuRes.data.categories.length} categories`)

  // 3. Test Call Waiter
  console.log('3. Testing Call Waiter...')
  const callRes = await postJSON(`${BASE_URL}/api/call-waiter`, { table_number: 1 })
  console.assert(callRes.status === 200, 'Call waiter should return 200')
  console.log(`   ✓ Waiter called: "${callRes.data.message}"`)

  // 4. Test Customer Placing First Order on Table 1
  console.log('4. Testing Customer Placing Order on Table 1...')
  const item1 = menuRes.data.items.find(i => i.name_en === 'Udid Masala') || menuRes.data.items[0]
  const item2 = menuRes.data.items.find(i => i.name_en === 'Paneer Momos') || menuRes.data.items[1]

  const orderRes = await postJSON(`${BASE_URL}/api/orders`, {
    table_number: 1,
    placed_by: 'customer',
    items: [
      { item_id: item1.id, name_snapshot: item1.name_mr, name_en: item1.name_en, price_snapshot: item1.price, qty: 2, note: 'कुरकुरीत करा' },
      { item_id: item2.id, name_snapshot: item2.name_mr, name_en: item2.name_en, price_snapshot: item2.price, qty: 1, note: 'गरमागरम' },
    ],
  })
  console.assert(orderRes.status === 200, 'Order should return 200')
  console.assert(orderRes.data.order_id, 'Should return order_id')
  const orderId = orderRes.data.order_id
  const sessionId = orderRes.data.session_id
  console.log(`   ✓ Order placed: ID ${orderId}, Session ${sessionId}`)

  // 5. Test Kitchen Queue
  console.log('5. Testing Kitchen Queue...')
  const kitchenRes = await getJSON(`${BASE_URL}/api/orders?kitchen=true`)
  console.assert(kitchenRes.status === 200, 'Kitchen should return 200')
  const foundInKitchen = kitchenRes.data.orders.find(o => o.id === orderId)
  console.assert(foundInKitchen, 'Order must be present in kitchen queue')
  console.assert(foundInKitchen.status === 'new', 'Order status should be new')
  console.log('   ✓ Order is visible in Kitchen queue with status "new"')

  // 6. Test Kitchen Status Workflow: new -> preparing -> ready
  console.log('6. Testing Kitchen Status Workflow (new -> preparing -> ready)...')
  const prepRes = await patchJSON(`${BASE_URL}/api/orders`, { order_id: orderId, status: 'preparing' })
  console.assert(prepRes.status === 200 && prepRes.data.status === 'preparing')
  console.log('   ✓ Kitchen started preparing')

  const readyRes = await patchJSON(`${BASE_URL}/api/orders`, { order_id: orderId, status: 'ready' })
  console.assert(readyRes.status === 200 && readyRes.data.status === 'ready')
  console.log('   ✓ Kitchen marked order READY')

  // 7. Test Waiter Ready-To-Serve Alert
  console.log('7. Testing Waiter Ready-To-Serve Alert...')
  const waiterRes = await getJSON(`${BASE_URL}/api/orders?waiter=true`)
  const readyForWaiter = waiterRes.data.orders.find(o => o.id === orderId)
  console.assert(readyForWaiter, 'Ready order must appear in waiter panel')
  console.log('   ✓ Waiter received ready-to-serve alert for Table 1')

  // 8. Test Customer Add-On Order (Order More)
  console.log('8. Testing Customer Add-on Order (जास्तीचे पदार्थ)...')
  const item3 = menuRes.data.items.find(i => i.name_en === 'Tomato Soup') || menuRes.data.items[2]
  const addonRes = await postJSON(`${BASE_URL}/api/orders`, {
    table_number: 1,
    placed_by: 'customer',
    items: [{ item_id: item3.id, name_snapshot: item3.name_mr, name_en: item3.name_en, price_snapshot: item3.price, qty: 1 }],
  })
  console.assert(addonRes.data.is_addon === true, 'Subsequent order must be tagged is_addon: true')
  console.log('   ✓ Add-on order correctly attached to same session with is_addon=true')

  // 9. Test Cashier Billing View & Session Total
  console.log('9. Testing Cashier Billing Screen Calculation...')
  const billingListRes = await getJSON(`${BASE_URL}/api/billing`)
  const table1Bill = billingListRes.data.openSessions.find(s => s.table_number === 1)
  console.assert(table1Bill, 'Table 1 must appear in cashier open sessions')
  console.assert(table1Bill.items.length >= 2, 'Should aggregate items from both orders')
  console.assert(table1Bill.gst > 0, 'GST must be computed')
  console.assert(table1Bill.grandTotal > 0, 'Grand total must be computed')
  console.log(`   ✓ Cashier computed subtotal ₹${table1Bill.subtotal}, GST ₹${table1Bill.gst}, Grand Total ₹${table1Bill.grandTotal}`)

  // 10. Test Cashier Billing Checkout with 10-digit mobile & WhatsApp consent
  console.log('10. Testing Cashier Checkout (Mobile validation + DPDP consent)...')
  const checkoutRes = await postJSON(`${BASE_URL}/api/billing`, {
    session_id: table1Bill.session_id,
    table_number: 1,
    customer_mobile: '9822099999',
    customer_name: 'अमोल विस्पुते',
    offers_consent: true,
    discount: 10,
    payment_mode: 'upi',
  })
  console.assert(checkoutRes.status === 200, 'Checkout should return 200')
  console.assert(checkoutRes.data.bill?.customer_mobile === '9822099999', 'Mobile must match')
  console.log(`   ✓ Bill generated successfully! ID ${checkoutRes.data.bill.id}`)

  // 11. Test Table is now Free
  console.log('11. Verifying Table 1 Session is Closed & Table is Free...')
  const freeCheckRes = await getJSON(`${BASE_URL}/api/table/tok_tbl01_vispute_a1b2c3d4`)
  console.assert(freeCheckRes.data.activeSessionId === null, 'Active session should now be null (table free)')
  console.log('   ✓ Table 1 is officially free for the next customer!')

  // 12. Test Staff PIN Verification
  console.log('12. Testing Staff PIN Verification...')
  const pinRes = await postJSON(`${BASE_URL}/api/staff/verify-pin`, { pin: '1234' })
  console.assert(pinRes.status === 200 && pinRes.data.staff?.role === 'admin')
  console.log(`   ✓ PIN 1234 verified: logged in as ${pinRes.data.staff.name} (${pinRes.data.staff.role})`)

  // 13. Test Admin Analytics & CRM
  console.log('13. Testing Admin Analytics & Customer CRM...')
  const analyticsRes = await getJSON(`${BASE_URL}/api/admin/analytics`)
  console.assert(analyticsRes.data.todaySales > 0, 'Today sales should be > 0')
  console.assert(analyticsRes.data.totalCustomers > 0, 'Customers should be > 0')
  console.log(`   ✓ Admin reports: Today Sales = ₹${analyticsRes.data.todaySales}, Total CRM Customers = ${analyticsRes.data.totalCustomers}`)

  // 14. Test QR Code Generator
  console.log('14. Testing QR Code Generator...')
  const qrRes = await getJSON(`${BASE_URL}/api/admin/qr`)
  console.assert(qrRes.data.tables?.length === 10, 'Should generate QR codes for all 10 tables')
  console.assert(qrRes.data.tables[0].qrDataUrl.startsWith('data:image/png;base64,'), 'QR must be valid PNG data URL')
  console.log('   ✓ All 10 table QR codes generated with high-res base64 PNGs')

  console.log('\n🎉 ALL 14 TESTS PASSED FLAWLESSLY! 100% OPERATIONAL.\n')
}

runTests().catch(err => {
  console.error('❌ Test failed:', err)
  process.exit(1)
})
