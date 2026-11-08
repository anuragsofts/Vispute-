-- ============================================================
-- Vispute Restaurant – Seed Data
-- 25 realistic Maharashtrian/Indian menu items
-- ============================================================

-- ----------------------------------------------------------------
-- 1. Tables (10 tables)
-- ----------------------------------------------------------------
INSERT INTO tables (number, secret_token, is_active) VALUES
  (1,  'tok_tbl01_vispute_a1b2c3d4', TRUE),
  (2,  'tok_tbl02_vispute_e5f6g7h8', TRUE),
  (3,  'tok_tbl03_vispute_i9j0k1l2', TRUE),
  (4,  'tok_tbl04_vispute_m3n4o5p6', TRUE),
  (5,  'tok_tbl05_vispute_q7r8s9t0', TRUE),
  (6,  'tok_tbl06_vispute_u1v2w3x4', TRUE),
  (7,  'tok_tbl07_vispute_y5z6a7b8', TRUE),
  (8,  'tok_tbl08_vispute_c9d0e1f2', TRUE),
  (9,  'tok_tbl09_vispute_g3h4i5j6', TRUE),
  (10, 'tok_tbl10_vispute_k7l8m9n0', TRUE);

-- ----------------------------------------------------------------
-- 2. Categories
-- ----------------------------------------------------------------
INSERT INTO categories (id, name_mr, name_en, sort_order, icon) VALUES
  ('cat-vada',   'वडापाव व स्नॅक्स',       'Vada Pav & Snacks',  1, '🥙'),
  ('cat-thali',  'थाळी',                     'Thali',              2, '🍛'),
  ('cat-curry',  'भाजी व करी',               'Sabzi & Curry',      3, '🍲'),
  ('cat-bread',  'पोळी व भात',               'Roti & Rice',        4, '🫓'),
  ('cat-fast',   'फास्ट फूड',                'Fast Food',          5, '🍔'),
  ('cat-drinks', 'पेये',                     'Drinks',             6, '🥤'),
  ('cat-sweet',  'मिठाई व गोड पदार्थ',       'Sweets & Desserts',  7, '🍮');

-- ----------------------------------------------------------------
-- 3. Menu Items – 25 realistic items
-- ----------------------------------------------------------------

-- Vada Pav & Snacks
INSERT INTO menu_items (category_id, name_mr, name_en, description_mr, price, is_veg, is_available, sort_order) VALUES
  ('cat-vada', 'वडापाव',               'Vada Pav',
   'खमंग बटाटा वडा, मसालेदार चटणी, लसूण चटणी सोबत',
   25,  TRUE, TRUE, 1),

  ('cat-vada', 'मसाला वडापाव',         'Masala Vada Pav',
   'दुहेरी वडा, कांदा, टोमॅटो आणि हिरवी चटणी',
   35,  TRUE, TRUE, 2),

  ('cat-vada', 'समोसा (२ पीस)',        'Samosa (2 pcs)',
   'कुरकुरीत समोसा, आलू-मटार सारण',
   40,  TRUE, TRUE, 3),

  ('cat-vada', 'मिसळ पाव',            'Misal Pav',
   'तिखट-मटकी उसळ, फरसाण, कांदा, लिंबू आणि पाव',
   80,  TRUE, TRUE, 4),

  ('cat-vada', 'भजी पाव (४ पीस)',     'Bhaji Pav (4 pcs)',
   'कांदा-मिरची भजी, पुदिना चटणी सोबत',
   50,  TRUE, TRUE, 5);

-- Thali
INSERT INTO menu_items (category_id, name_mr, name_en, description_mr, price, is_veg, is_available, sort_order) VALUES
  ('cat-thali', 'साधी थाळी',           'Simple Thali',
   'भात, वरण, भाजी, पोळी, लोणचे, पापड',
   120, TRUE, TRUE, 1),

  ('cat-thali', 'स्पेशल थाळी',         'Special Thali',
   'भात, वरण, दोन भाज्या, श्रीखंड, पोळी, पुरी, लोणचे, पापड',
   180, TRUE, TRUE, 2),

  ('cat-thali', 'चिकन थाळी',           'Chicken Thali',
   'भात, चिकन रस्सा, चपाती, कोशिंबीर, लोणचे',
   200, FALSE, TRUE, 3),

  ('cat-thali', 'मटण थाळी',            'Mutton Thali',
   'भात, मटण रस्सा, चपाती, कोशिंबीर, सोलकढी',
   250, FALSE, TRUE, 4);

-- Sabzi & Curry
INSERT INTO menu_items (category_id, name_mr, name_en, description_mr, price, is_veg, is_available, sort_order) VALUES
  ('cat-curry', 'पनीर भाजी',           'Paneer Bhaji',
   'ताजे पनीर, कांदा-टोमॅटो मसाला',
   130, TRUE, TRUE, 1),

  ('cat-curry', 'वांगे भरीत',          'Vangi Bharit',
   'भाजलेले वांगे, शेंगदाणे, कांदा, कोथिंबीर',
   90,  TRUE, TRUE, 2),

  ('cat-curry', 'पिठले',               'Pithale',
   'बेसन पिठले, कांदा आणि हिरव्या मिरच्यांसह',
   70,  TRUE, TRUE, 3),

  ('cat-curry', 'चिकन रस्सा',          'Chicken Rassa',
   'मराठमोळा तांबडा रस्सा, कोल्हापुरी मसाला',
   160, FALSE, TRUE, 4),

  ('cat-curry', 'मटण रस्सा',           'Mutton Rassa',
   'हाडाचे मटण, खासपेशल मसाला',
   200, FALSE, TRUE, 5);

-- Roti & Rice
INSERT INTO menu_items (category_id, name_mr, name_en, description_mr, price, is_veg, is_available, sort_order) VALUES
  ('cat-bread', 'तंदूर रोटी',          'Tandoor Roti',
   'मऊ, गव्हाच्या पिठाची तंदूर रोटी',
   20,  TRUE, TRUE, 1),

  ('cat-bread', 'ज्वारी भाकरी',        'Jwari Bhakri',
   'हाताने बनवलेली ज्वारी भाकरी (एक)',
   15,  TRUE, TRUE, 2),

  ('cat-bread', 'वाफाळलेला भात',       'Steamed Rice',
   'पांढरा शुभ्र वाफवलेला भात, एक वाटी',
   40,  TRUE, TRUE, 3),

  ('cat-bread', 'मसाला भात',           'Masala Rice',
   'भाज्या व मसाल्यांसह तळलेला भात',
   100, TRUE, TRUE, 4);

-- Fast Food
INSERT INTO menu_items (category_id, name_mr, name_en, description_mr, price, is_veg, is_available, sort_order) VALUES
  ('cat-fast', 'पाव भाजी',             'Pav Bhaji',
   'मसालेदार मिश्र भाजी, लोणी, पाव',
   120, TRUE, TRUE, 1),

  ('cat-fast', 'चीज बर्गर',            'Cheese Burger',
   'क्रिस्पी पॅटी, चेडर चीज, कोशिंबीर',
   140, TRUE, TRUE, 2),

  ('cat-fast', 'चिकन बर्गर',           'Chicken Burger',
   'क्रिस्पी चिकन पॅटी, मेयो, लेट्यूस',
   160, FALSE, TRUE, 3),

  ('cat-fast', 'फ्राईड राईस',          'Fried Rice',
   'भाज्या / चिकन / एग (निवडा)',
   130, TRUE, TRUE, 4);

-- Drinks
INSERT INTO menu_items (category_id, name_mr, name_en, description_mr, price, is_veg, is_available, sort_order) VALUES
  ('cat-drinks', 'ताक',               'Taak (Buttermilk)',
   'थंड मसालेदार ताक, जिरे, कोथिंबीर',
   40,  TRUE, TRUE, 1),

  ('cat-drinks', 'लिंबू सरबत',        'Limbu Sarbat',
   'ताजे लिंबू, काळे मीठ, साखर',
   50,  TRUE, TRUE, 2),

  ('cat-drinks', 'सोलकढी',            'Solkadhi',
   'कोकम आणि नारळाचे दूध, पाचक पेय',
   60,  TRUE, TRUE, 3);

-- Sweets & Desserts
INSERT INTO menu_items (category_id, name_mr, name_en, description_mr, price, is_veg, is_available, sort_order) VALUES
  ('cat-sweet', 'गुलाब जामुन (२ पीस)', 'Gulab Jamun (2 pcs)',
   'मऊ गुलाब जामुन, साखरेच्या पाकात',
   60,  TRUE, TRUE, 1),

  ('cat-sweet', 'श्रीखंड',             'Shrikhand',
   'केशर-वेलची श्रीखंड, मस्त मलाईदार',
   80,  TRUE, TRUE, 2);
