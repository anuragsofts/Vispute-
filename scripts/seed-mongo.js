// ============================================================
// Vispute Restaurant – MongoDB Seed Script
// Seeds: tables, categories, menu_items, staff
// ============================================================

const { MongoClient } = require('mongodb')

const uri = 'mongodb+srv://visputefoodcourt_db_user:IzwgbQhmWz8nLMu5@cluster0.k0bkmub.mongodb.net/vispute?retryWrites=true&w=majority'

async function seed() {
  const client = new MongoClient(uri)
  try {
    await client.connect()
    console.log('Connected to MongoDB Atlas...')
    const db = client.db('vispute')

    // 1. Tables
    console.log('Seeding tables...')
    const tablesCol = db.collection('tables')
    await tablesCol.deleteMany({})
    await tablesCol.createIndex({ number: 1 }, { unique: true })
    await tablesCol.createIndex({ secret_token: 1 }, { unique: true })

    const tables = [
      { number: 1,  secret_token: 'tok_tbl01_vispute_a1b2c3d4', is_active: true, created_at: new Date() },
      { number: 2,  secret_token: 'tok_tbl02_vispute_e5f6g7h8', is_active: true, created_at: new Date() },
      { number: 3,  secret_token: 'tok_tbl03_vispute_i9j0k1l2', is_active: true, created_at: new Date() },
      { number: 4,  secret_token: 'tok_tbl04_vispute_m3n4o5p6', is_active: true, created_at: new Date() },
      { number: 5,  secret_token: 'tok_tbl05_vispute_q7r8s9t0', is_active: true, created_at: new Date() },
      { number: 6,  secret_token: 'tok_tbl06_vispute_u1v2w3x4', is_active: true, created_at: new Date() },
      { number: 7,  secret_token: 'tok_tbl07_vispute_y5z6a7b8', is_active: true, created_at: new Date() },
      { number: 8,  secret_token: 'tok_tbl08_vispute_c9d0e1f2', is_active: true, created_at: new Date() },
      { number: 9,  secret_token: 'tok_tbl09_vispute_g3h4i5j6', is_active: true, created_at: new Date() },
      { number: 10, secret_token: 'tok_tbl10_vispute_k7l8m9n0', is_active: true, created_at: new Date() },
    ]
    await tablesCol.insertMany(tables)
    console.log(`✓ Seeded ${tables.length} tables`)

    // 2. Categories
    console.log('Seeding categories...')
    const catCol = db.collection('categories')
    await catCol.deleteMany({})
    await catCol.createIndex({ slug: 1 }, { unique: true })

    const categories = [
      { slug: 'vada',   name_mr: 'वडापाव व स्नॅक्स',       name_en: 'Vada Pav & Snacks',  sort_order: 1, icon: '🥙' },
      { slug: 'thali',  name_mr: 'थाळी',                     name_en: 'Thali',              sort_order: 2, icon: '🍛' },
      { slug: 'curry',  name_mr: 'भाजी व करी',               name_en: 'Sabzi & Curry',      sort_order: 3, icon: '🍲' },
      { slug: 'bread',  name_mr: 'पोळी व भात',               name_en: 'Roti & Rice',        sort_order: 4, icon: '🫓' },
      { slug: 'fast',   name_mr: 'फास्ट फूड',                name_en: 'Fast Food',          sort_order: 5, icon: '🍔' },
      { slug: 'drinks', name_mr: 'पेये',                     name_en: 'Drinks',             sort_order: 6, icon: '🥤' },
      { slug: 'sweet',  name_mr: 'मिठाई व गोड पदार्थ',       name_en: 'Sweets & Desserts',  sort_order: 7, icon: '🍮' },
    ]
    await catCol.insertMany(categories)
    console.log(`✓ Seeded ${categories.length} categories`)

    // 3. Menu items
    console.log('Seeding menu items...')
    const itemsCol = db.collection('menu_items')
    await itemsCol.deleteMany({})
    await itemsCol.createIndex({ category_slug: 1 })
    await itemsCol.createIndex({ is_available: 1 })

    const menuItems = [
      // Vada Pav & Snacks
      {
        category_slug: 'vada',
        name_mr: 'वडापाव',
        name_en: 'Vada Pav',
        description_mr: 'खमंग बटाटा वडा, मसालेदार चटणी, लसूण चटणी सोबत',
        price: 25,
        is_veg: true,
        is_available: true,
        sort_order: 1,
        image_url: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80',
        created_at: new Date()
      },
      {
        category_slug: 'vada',
        name_mr: 'मसाला वडापाव',
        name_en: 'Masala Vada Pav',
        description_mr: 'दुहेरी वडा, कांदा, टोमॅटो आणि हिरवी चटणी',
        price: 35,
        is_veg: true,
        is_available: true,
        sort_order: 2,
        image_url: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80',
        created_at: new Date()
      },
      {
        category_slug: 'vada',
        name_mr: 'समोसा (२ पीस)',
        name_en: 'Samosa (2 pcs)',
        description_mr: 'कुरकुरीत समोसा, आलू-मटार सारण, चिंच चटणी सोबत',
        price: 40,
        is_veg: true,
        is_available: true,
        sort_order: 3,
        image_url: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80',
        created_at: new Date()
      },
      {
        category_slug: 'vada',
        name_mr: 'मिसळ पाव',
        name_en: 'Misal Pav',
        description_mr: 'तिखट-मटकी उसळ, फरसाण, कांदा, लिंबू आणि २ पाव',
        price: 80,
        is_veg: true,
        is_available: true,
        sort_order: 4,
        image_url: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=600&auto=format&fit=crop&q=80',
        created_at: new Date()
      },
      {
        category_slug: 'vada',
        name_mr: 'भजी पाव (४ पीस)',
        name_en: 'Bhaji Pav (4 pcs)',
        description_mr: 'कांदा-मिरची भजी, पुदिना चटणी सोबत',
        price: 50,
        is_veg: true,
        is_available: true,
        sort_order: 5,
        image_url: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80',
        created_at: new Date()
      },

      // Thali
      {
        category_slug: 'thali',
        name_mr: 'साधी थाळी',
        name_en: 'Simple Thali',
        description_mr: 'भात, वरण, भाजी, २ चपाती, लोणचे, पापड',
        price: 120,
        is_veg: true,
        is_available: true,
        sort_order: 1,
        image_url: 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?w=600&auto=format&fit=crop&q=80',
        created_at: new Date()
      },
      {
        category_slug: 'thali',
        name_mr: 'स्पेशल थाळी',
        name_en: 'Special Thali',
        description_mr: 'भात, वरण, २ भाज्या, श्रीखंड, ३ चपाती, पुरी, लोणचे, पापड',
        price: 180,
        is_veg: true,
        is_available: true,
        sort_order: 2,
        image_url: 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?w=600&auto=format&fit=crop&q=80',
        created_at: new Date()
      },
      {
        category_slug: 'thali',
        name_mr: 'चिकन थाळी',
        name_en: 'Chicken Thali',
        description_mr: 'भात, चिकन रस्सा, २ चपाती किंवा २ भाकरी, कोशिंबीर, लोणचे',
        price: 200,
        is_veg: false,
        is_available: true,
        sort_order: 3,
        image_url: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=600&auto=format&fit=crop&q=80',
        created_at: new Date()
      },
      {
        category_slug: 'thali',
        name_mr: 'मटण थाळी',
        name_en: 'Mutton Thali',
        description_mr: 'भात, मटण रस्सा, २ बाजरी भाकरी, कोशिंबीर, सोलकढी',
        price: 250,
        is_veg: false,
        is_available: true,
        sort_order: 4,
        image_url: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=600&auto=format&fit=crop&q=80',
        created_at: new Date()
      },

      // Sabzi & Curry
      {
        category_slug: 'curry',
        name_mr: 'पनीर भाजी',
        name_en: 'Paneer Masala',
        description_mr: 'ताजे पनीर, खमंग कांदा-टोमॅटो मसाला ग्रेव्ही',
        price: 130,
        is_veg: true,
        is_available: true,
        sort_order: 1,
        image_url: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=600&auto=format&fit=crop&q=80',
        created_at: new Date()
      },
      {
        category_slug: 'curry',
        name_mr: 'वांगे भरीत',
        name_en: 'Vangi Bharit',
        description_mr: 'भाजलेले वांगे, शेंगदाणा कूट, कांदा आणि कोथिंबीर',
        price: 90,
        is_veg: true,
        is_available: true,
        sort_order: 2,
        image_url: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=600&auto=format&fit=crop&q=80',
        created_at: new Date()
      },
      {
        category_slug: 'curry',
        name_mr: 'पिठले',
        name_en: 'Pithale',
        description_mr: 'गरमागरम बेसन पिठले, कांदा आणि हिरव्या मिरच्यांची फोडणी',
        price: 70,
        is_veg: true,
        is_available: true,
        sort_order: 3,
        image_url: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=600&auto=format&fit=crop&q=80',
        created_at: new Date()
      },
      {
        category_slug: 'curry',
        name_mr: 'तांबडा चिकन रस्सा',
        name_en: 'Tambada Chicken Rassa',
        description_mr: 'कोल्हापुरी तांबडा रस्सा, मसालेदार गावरान चिकन',
        price: 160,
        is_veg: false,
        is_available: true,
        sort_order: 4,
        image_url: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=600&auto=format&fit=crop&q=80',
        created_at: new Date()
      },
      {
        category_slug: 'curry',
        name_mr: 'मटण रस्सा',
        name_en: 'Mutton Rassa',
        description_mr: 'मऊ शिजवलेले मटण, मराठमोळा खास काळा मसाला',
        price: 200,
        is_veg: false,
        is_available: true,
        sort_order: 5,
        image_url: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=600&auto=format&fit=crop&q=80',
        created_at: new Date()
      },

      // Roti & Rice
      {
        category_slug: 'bread',
        name_mr: 'तंदूर रोटी',
        name_en: 'Tandoor Roti',
        description_mr: 'गरमागरम गव्हाची तंदूर रोटी',
        price: 20,
        is_veg: true,
        is_available: true,
        sort_order: 1,
        image_url: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80',
        created_at: new Date()
      },
      {
        category_slug: 'bread',
        name_mr: 'ज्वारी भाकरी',
        name_en: 'Jwari Bhakri',
        description_mr: 'हाताने थापलेली मऊ ज्वारी भाकरी (१ नग)',
        price: 15,
        is_veg: true,
        is_available: true,
        sort_order: 2,
        image_url: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80',
        created_at: new Date()
      },
      {
        category_slug: 'bread',
        name_mr: 'वाफाळलेला भात',
        name_en: 'Steamed Rice',
        description_mr: 'पांढरा शुभ्र वाफवलेला इंद्रायणी भात (फुल वाटी)',
        price: 40,
        is_veg: true,
        is_available: true,
        sort_order: 3,
        image_url: 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?w=600&auto=format&fit=crop&q=80',
        created_at: new Date()
      },
      {
        category_slug: 'bread',
        name_mr: 'मसाला भात',
        name_en: 'Masala Bhaat',
        description_mr: 'भाज्या, तोंडली, काजू व गोडा मसाल्याचा भात',
        price: 100,
        is_veg: true,
        is_available: true,
        sort_order: 4,
        image_url: 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?w=600&auto=format&fit=crop&q=80',
        created_at: new Date()
      },

      // Fast Food
      {
        category_slug: 'fast',
        name_mr: 'पाव भाजी',
        name_en: 'Pav Bhaji',
        description_mr: 'मसालेदार अमूल बटर पाव भाजी, २ बटर पाव, कांदा लिंबू',
        price: 120,
        is_veg: true,
        is_available: true,
        sort_order: 1,
        image_url: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=600&auto=format&fit=crop&q=80',
        created_at: new Date()
      },
      {
        category_slug: 'fast',
        name_mr: 'चीज बर्गर',
        name_en: 'Cheese Burger',
        description_mr: 'कुरकुरीत आलू टिक्की, चेडर चीज स्लाइस, लेट्यूस, टोमॅटो',
        price: 140,
        is_veg: true,
        is_available: true,
        sort_order: 2,
        image_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80',
        created_at: new Date()
      },
      {
        category_slug: 'fast',
        name_mr: 'चिकन बर्गर',
        name_en: 'Chicken Burger',
        description_mr: 'क्रिस्पी चिकन पॅटी, मेयोनीज, कोबी लेट्यूस आणि चीज',
        price: 160,
        is_veg: false,
        is_available: true,
        sort_order: 3,
        image_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80',
        created_at: new Date()
      },
      {
        category_slug: 'fast',
        name_mr: 'व्हेज फ्राईड राईस',
        name_en: 'Veg Fried Rice',
        description_mr: 'बासमती तांदूळ, बारीक चिरलेल्या भाज्या, शेजवान सॉस',
        price: 130,
        is_veg: true,
        is_available: true,
        sort_order: 4,
        image_url: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=600&auto=format&fit=crop&q=80',
        created_at: new Date()
      },

      // Drinks
      {
        category_slug: 'drinks',
        name_mr: 'ताक',
        name_en: 'Masala Taak (Buttermilk)',
        description_mr: 'थंडगार मसालेदार ताक, भाजलेले जिरे, कोथिंबीर, काळे मीठ',
        price: 40,
        is_veg: true,
        is_available: true,
        sort_order: 1,
        image_url: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=600&auto=format&fit=crop&q=80',
        created_at: new Date()
      },
      {
        category_slug: 'drinks',
        name_mr: 'लिंबू सरबत',
        name_en: 'Fresh Limbu Sarbat',
        description_mr: 'ताजे लिंबू, साखर, काळे मीठ, जिरेपूड',
        price: 50,
        is_veg: true,
        is_available: true,
        sort_order: 2,
        image_url: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=600&auto=format&fit=crop&q=80',
        created_at: new Date()
      },
      {
        category_slug: 'drinks',
        name_mr: 'सोलकढी',
        name_en: 'Solkadhi',
        description_mr: 'कोकणी पाचक पेय, कोकम आणि नारळाचे दूध, लसूण-मिरची फोडणी',
        price: 60,
        is_veg: true,
        is_available: true,
        sort_order: 3,
        image_url: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=600&auto=format&fit=crop&q=80',
        created_at: new Date()
      },

      // Sweets & Desserts
      {
        category_slug: 'sweet',
        name_mr: 'गुलाब जामुन (२ पीस)',
        name_en: 'Gulab Jamun (2 pcs)',
        description_mr: 'खव्याचे मऊ आणि रसरशीत गुलाब जामुन, वेलची पाकात',
        price: 60,
        is_veg: true,
        is_available: true,
        sort_order: 1,
        image_url: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80',
        created_at: new Date()
      },
      {
        category_slug: 'sweet',
        name_mr: 'केशर श्रीखंड',
        name_en: 'Kesar Shrikhand',
        description_mr: 'चक्का, केशर, वेलची आणि बदामाचे तुकडे घातलेले श्रीखंड',
        price: 80,
        is_veg: true,
        is_available: true,
        sort_order: 2,
        image_url: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80',
        created_at: new Date()
      },
    ]

    await itemsCol.insertMany(menuItems)
    console.log(`✓ Seeded ${menuItems.length} menu items`)

    // 4. Staff accounts
    console.log('Seeding staff...')
    const staffCol = db.collection('staff')
    await staffCol.deleteMany({})
    await staffCol.createIndex({ pin: 1 })
    await staffCol.createIndex({ role: 1 })

    const staff = [
      { name: 'Admin (मालक)', role: 'admin', pin: '1234', created_at: new Date() },
      { name: 'कॅशियर (रोखपाल)', role: 'cashier', pin: '2345', created_at: new Date() },
      { name: 'वेटर १ (राजू)', role: 'waiter', pin: '3456', created_at: new Date() },
      { name: 'किचन शेफ (किचन)', role: 'kitchen', pin: '4567', created_at: new Date() },
    ]
    await staffCol.insertMany(staff)
    console.log(`✓ Seeded ${staff.length} staff members (easy 4-digit PIN access)`)

    // 5. Setup indexes on orders & sessions
    console.log('Configuring indexes for orders, sessions, and bills...')
    const sessionsCol = db.collection('table_sessions')
    await sessionsCol.createIndex({ table_number: 1, status: 1 })
    await sessionsCol.createIndex({ status: 1 })

    const ordersCol = db.collection('orders')
    await ordersCol.createIndex({ session_id: 1 })
    await ordersCol.createIndex({ status: 1 })
    await ordersCol.createIndex({ created_at: -1 })

    const billsCol = db.collection('bills')
    await billsCol.createIndex({ paid_at: -1 })
    await billsCol.createIndex({ customer_mobile: 1 })

    const customersCol = db.collection('customers')
    await customersCol.createIndex({ mobile: 1 }, { unique: true })

    console.log('✅ ALL MONGODB COLLECTIONS & INDEXES SUCCESSFULLY SEEDED!')
  } catch (err) {
    console.error('Seed error:', err)
  } finally {
    await client.close()
  }
}

seed()
