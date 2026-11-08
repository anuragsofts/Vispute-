const { MongoClient } = require('mongodb')

const uri = 'mongodb+srv://visputefoodcourt_db_user:IzwgbQhmWz8nLMu5@cluster0.k0bkmub.mongodb.net/vispute?retryWrites=true&w=majority'

const rawItems = [
  { "name": "Udid Roast", "category": "Papad", "price": "20", "name_marathi": "उडीद भाजणे" },
  { "name": "Udid Fry", "category": "Papad", "price": "20", "name_marathi": "उडीद तळणे" },
  { "name": "Udid Masala", "category": "Papad", "price": "30", "name_marathi": "उडीद मसाला" },
  { "name": "Nagali Roast", "category": "Papad", "price": "20", "name_marathi": "नागली भाजणे" },
  { "name": "Nagali Fry", "category": "Papad", "price": "25", "name_marathi": "नागली फ्राय" },
  { "name": "Nagali Masala", "category": "Papad", "price": "40", "name_marathi": "नागली मसाला" },
  { "name": "Paneer Momos", "category": "Momos", "price": "130", "name_marathi": "पनीर मोमोज" },
  { "name": "Steam Momos", "category": "Momos", "price": "120", "name_marathi": "स्टीम मोमोज" },
  { "name": "Tomato Soup", "category": "Soup", "price": "120", "name_marathi": "टोमॅटो सूप" },
  { "name": "Manchow Soup", "category": "Soup", "price": "100", "name_marathi": "मांचो सूप" },
  { "name": "Manchurian Soup", "category": "Soup", "price": "110", "name_marathi": "मंचुरियन सूप" },
  { "name": "Garlic Soup", "category": "Soup", "price": "110", "name_marathi": "लसूण सूप" },
  { "name": "Hot and Sour Soup", "category": "Soup", "price": "110", "name_marathi": "गरम आणि आंबट सूप" },
  { "name": "Mushroom Soup", "category": "Soup", "price": "150", "name_marathi": "मशरूम सूप" },
  { "name": "Taiwan Soup", "category": "Soup", "price": "180", "name_marathi": "तैवान सूप" },
  { "name": "Veg Clear Soup", "category": "Soup", "price": "100", "name_marathi": "व्हेज क्लिअर सूप" },
  { "name": "Lemon Coriander Soup", "category": "Soup", "price": "120", "name_marathi": "लिंबू कोथिंबीर सूप" },
  { "name": "Chaas", "category": "Beverages", "price": "20", "name_marathi": "चास" },
  { "name": "Finger Chips", "category": "Indian Starter", "price": "90", "name_marathi": "फिंगर चिप्स" },
  { "name": "Paneer Pakoda", "category": "Indian Starter", "price": "180", "name_marathi": "पनीर पकोडा" },
  { "name": "Kanda Bhaji", "category": "Indian Starter", "price": "100", "name_marathi": "कांदा भजी" },
  { "name": "Paneer Lahori", "category": "Tandoor Starter", "price": "299", "name_marathi": "पनीर लाहोरी" },
  { "name": "Paneer Afghani Roll", "category": "Tandoor Starter", "price": "550", "name_marathi": "पनीर अफगाणी रोल" },
  { "name": "Paneer Parda", "category": "Tandoor Starter", "price": "550", "name_marathi": "पनीर पर्दा" },
  { "name": "Paneer Malai Tikka", "category": "Tandoor Starter", "price": "380", "name_marathi": "पनीर मलाई टिक्का" },
  { "name": "Paneer Pahadi Tikka", "category": "Tandoor Starter", "price": "350", "name_marathi": "पनीर पहाडी टिक्का" },
  { "name": "Paneer Banjara Tikka", "category": "Tandoor Starter", "price": "350", "name_marathi": "पनीर बंजारा टिक्का" },
  { "name": "Paneer Achari Tikka", "category": "Tandoor Starter", "price": "350", "name_marathi": "पनीर आचारी टिक्का" },
  { "name": "Paneer Matka", "category": "Tandoor Starter", "price": "580", "name_marathi": "पनीर मटका" },
  { "name": "Veg Rosala Dum Potato", "category": "Tandoor Starter", "price": "350", "name_marathi": "व्हेज रोसाला दम बटाटा" },
  { "name": "Veg Seekh Kabab", "category": "Tandoor Starter", "price": "299", "name_marathi": "व्हेज सीख कबाब" },
  { "name": "Veg Cheese Roll", "category": "Tandoor Starter", "price": "399", "name_marathi": "व्हेज चीज रोल" },
  { "name": "Tandoor Starter Platter", "category": "Tandoor Starter", "price": "999", "name_marathi": "तंदूर स्टार्टर थाळी" },
  { "name": "Baby Corn Tikka", "category": "Tandoor Starter", "price": "350", "name_marathi": "बेबी कॉर्न टिक्का" },
  { "name": "Mushroom Tikka", "category": "Tandoor Starter", "price": "350", "name_marathi": "मशरूम टिक्का" },
  { "name": "Stuffed Mushroom", "category": "Tandoor Starter", "price": "450", "name_marathi": "चोंदलेले मशरूम" },
  { "name": "Cheese Rumali Khakra", "category": "Tandoor Starter", "price": "180", "name_marathi": "चीज रुमाली खाकरा" },
  { "name": "Soyabean Chilli", "category": "Chinese Starter", "price": "100", "name_marathi": "सोयाबीन मिरची" },
  { "name": "Veg Manchurian", "category": "Chinese Starter", "price": "120", "name_marathi": "व्हेज मंचुरियन" },
  { "name": "Veg Manchurian Gravy", "category": "Chinese Starter", "price": "140", "name_marathi": "व्हेज मंचुरियन ग्रेव्ही" },
  { "name": "Paneer Chilli", "category": "Chinese Starter", "price": "180", "name_marathi": "पनीर मिरची" },
  { "name": "Mushroom Chilli", "category": "Chinese Starter", "price": "180", "name_marathi": "मशरूम मिरची" },
  { "name": "Paneer Mexican", "category": "Chinese Starter", "price": "299", "name_marathi": "पनीर मेक्सिकन" },
  { "name": "Paneer Sizzler", "category": "Chinese Starter", "price": "499", "name_marathi": "पनीर सिझलर" },
  { "name": "Paneer Steak Sizzler", "category": "Chinese Starter", "price": "550", "name_marathi": "पनीर स्टीक सिझलर" },
  { "name": "Paneer Forest", "category": "Chinese Starter", "price": "499", "name_marathi": "पनीरचे जंगल" },
  { "name": "American Chopsuey", "category": "Chinese Starter", "price": "350", "name_marathi": "अमेरिकन चॉप्सुए" },
  { "name": "Paneer Satay", "category": "Chinese Starter", "price": "399", "name_marathi": "पनीर साटे" },
  { "name": "Paneer 65", "category": "Chinese Starter", "price": "199", "name_marathi": "पनीर 65" },
  { "name": "Paneer Crispy", "category": "Chinese Starter", "price": "199", "name_marathi": "पनीर कुरकुरीत" },
  { "name": "Veg Spring Roll", "category": "Chinese Starter", "price": "150", "name_marathi": "व्हेज स्प्रिंग रोल" },
  { "name": "Veg Lollipop", "category": "Chinese Starter", "price": "199", "name_marathi": "व्हेज लॉलीपॉप" },
  { "name": "Cheese Corn Tikka", "category": "Chinese Starter", "price": "299", "name_marathi": "चीज कॉर्न टिक्का" },
  { "name": "Cheese Ball", "category": "Chinese Starter", "price": "299", "name_marathi": "चीज बॉल" },
  { "name": "Veg Golden Coin", "category": "Chinese Starter", "price": "220", "name_marathi": "व्हेज गोल्डन कॉईन" },
  { "name": "Veg Shehni Roll", "category": "Chinese Starter", "price": "250", "name_marathi": "व्हेज शेहनी रोल" },
  { "name": "Chinese Bhel", "category": "Noodles", "price": "150", "name_marathi": "चायनीज भेळ" },
  { "name": "Hakka Noodles", "category": "Noodles", "price": "130", "name_marathi": "हक्का नूडल्स" },
  { "name": "Schezwan Noodles", "category": "Noodles", "price": "150", "name_marathi": "शेझवान नूडल्स" },
  { "name": "Triple Noodles", "category": "Noodles", "price": "250", "name_marathi": "ट्रिपल नूडल्स" },
  { "name": "Singapore Noodles", "category": "Noodles", "price": "180", "name_marathi": "सिंगापूर नूडल्स" },
  { "name": "Manchurian Noodles", "category": "Noodles", "price": "180", "name_marathi": "मंचुरियन नूडल्स" },
  { "name": "Paneer Noodles", "category": "Noodles", "price": "220", "name_marathi": "पनीर नूडल्स" },
  { "name": "Mushroom Noodles", "category": "Noodles", "price": "200", "name_marathi": "मशरूम नूडल्स" },
  { "name": "Fried Rice", "category": "Chinese Rice", "price": "140", "name_marathi": "तळलेले तांदूळ" },
  { "name": "Paneer Fried Rice", "category": "Chinese Rice", "price": "220", "name_marathi": "पनीर फ्राईड राइस" },
  { "name": "Schezwan Rice", "category": "Chinese Rice", "price": "160", "name_marathi": "शेझवान तांदूळ" },
  { "name": "Singapore Rice", "category": "Chinese Rice", "price": "180", "name_marathi": "सिंगापूर तांदूळ" },
  { "name": "Manchurian Rice", "category": "Chinese Rice", "price": "180", "name_marathi": "मंचुरियन भात" },
  { "name": "Triple Rice", "category": "Chinese Rice", "price": "250", "name_marathi": "तिप्पट तांदूळ" },
  { "name": "Mushroom Rice", "category": "Chinese Rice", "price": "200", "name_marathi": "मशरूम तांदूळ" },
  { "name": "Shev Bhaji", "category": "Veg Bahar", "price": "100", "name_marathi": "शेवभाजी" },
  { "name": "Shev Tadka", "category": "Veg Bahar", "price": "120", "name_marathi": "शेव तडका" },
  { "name": "Shev Tomato", "category": "Veg Bahar", "price": "120", "name_marathi": "शेव टोमॅटो" },
  { "name": "Special Shev Bhaji", "category": "Veg Bahar", "price": "150", "name_marathi": "स्पेशल शेवभाजी" },
  { "name": "Dal Fry", "category": "Veg Bahar", "price": "110", "name_marathi": "डाळ फ्राय" },
  { "name": "Dal Tadka", "category": "Veg Bahar", "price": "120", "name_marathi": "दाल तडका" },
  { "name": "Soyabean Masala", "category": "Veg Bahar", "price": "110", "name_marathi": "सोयाबीन मसाला" },
  { "name": "Baingan Masala", "category": "Veg Bahar", "price": "120", "name_marathi": "बैंगन मसाला" },
  { "name": "Bhaji Amti", "category": "Veg Bahar", "price": "110", "name_marathi": "भजी आमटी" },
  { "name": "Chana Masala", "category": "Veg Bahar", "price": "120", "name_marathi": "चना मसाला" },
  { "name": "Shevga Masala", "category": "Veg Bahar", "price": "120", "name_marathi": "शेवगा मसाला" },
  { "name": "Besan Pithla", "category": "Veg Bahar", "price": "110", "name_marathi": "बेसन पिठला" },
  { "name": "Bhindi Masala", "category": "Veg Bahar", "price": "120", "name_marathi": "भिंडी मसाला" },
  { "name": "Methi Pithla", "category": "Veg Bahar", "price": "120", "name_marathi": "मेथी पिठला" },
  { "name": "Methi Masala", "category": "Veg Bahar", "price": "120", "name_marathi": "मेथी मसाला" },
  { "name": "Aloo Matar", "category": "Veg Bahar", "price": "150", "name_marathi": "आलू मातर" },
  { "name": "Lasoon Methi", "category": "Veg Bahar", "price": "150", "name_marathi": "लसून मेथी" },
  { "name": "Aloo Jeera", "category": "Veg Bahar", "price": "120", "name_marathi": "आलू जीरा" },
  { "name": "Malai Methi", "category": "Veg Bahar", "price": "150", "name_marathi": "मलाई मेथी" },
  { "name": "Lasoon Palak", "category": "Veg Bahar", "price": "150", "name_marathi": "लासून पालक" },
  { "name": "Green Palak", "category": "Veg Bahar", "price": "120", "name_marathi": "हिरवी पालक" },
  { "name": "Tomato Chutney", "category": "Veg Bahar", "price": "110", "name_marathi": "टोमॅटो चटणी" },
  { "name": "Mirchi Thecha", "category": "Veg Bahar", "price": "80", "name_marathi": "मिर्ची थेचा" },
  { "name": "Papad Churi", "category": "Veg Bahar", "price": "110", "name_marathi": "पापड चुरी" },
  { "name": "Kaju Masala", "category": "Special Veg", "price": "200", "name_marathi": "काजू मसाला" },
  { "name": "Kaju Curry Sweet", "category": "Special Veg", "price": "250", "name_marathi": "काजू करी गोड" },
  { "name": "Kaju Angara", "category": "Special Veg", "price": "250", "name_marathi": "काजू अंगारा" },
  { "name": "Kaju Mushroom Masala", "category": "Special Veg", "price": "220", "name_marathi": "काजू मशरूम मसाला" },
  { "name": "Mushroom Masala", "category": "Special Veg", "price": "180", "name_marathi": "मशरूम मसाला" },
  { "name": "Veg Angara", "category": "Special Veg", "price": "240", "name_marathi": "व्हेज अंगारा" },
  { "name": "Veg Khazana", "category": "Special Veg", "price": "180", "name_marathi": "व्हेज खजाना" },
  { "name": "Veg Hyderabadi", "category": "Special Veg", "price": "170", "name_marathi": "हैदराबादी व्हेज" },
  { "name": "Veg Lahori", "category": "Special Veg", "price": "160", "name_marathi": "लाहोरी व्हेज" },
  { "name": "Veg Kolhapuri", "category": "Special Veg", "price": "120", "name_marathi": "व्हेज कोल्हापुरी" },
  { "name": "Cheese Mushroom Masala", "category": "Special Veg", "price": "250", "name_marathi": "चीज मशरूम मसाला" },
  { "name": "Mix Veg", "category": "Special Veg", "price": "110", "name_marathi": "मिक्स व्हेज" },
  { "name": "Malai Kofta", "category": "Special Veg", "price": "250", "name_marathi": "मलाई कोफ्ता" },
  { "name": "Veg Kadai", "category": "Special Veg", "price": "180", "name_marathi": "व्हेज कढई" },
  { "name": "Veg Kofta", "category": "Special Veg", "price": "220", "name_marathi": "व्हेज कोफ्ता" },
  { "name": "Veg Patiala", "category": "Special Veg", "price": "200", "name_marathi": "व्हेज पटियाला" },
  { "name": "Veg Jaipuri", "category": "Special Veg", "price": "180", "name_marathi": "व्हेज जयपुरी" },
  { "name": "Veg Bhuna", "category": "Special Veg", "price": "180", "name_marathi": "व्हेज भुना" },
  { "name": "Veg Maharaja", "category": "Special Veg", "price": "200", "name_marathi": "व्हेज महाराजा" },
  { "name": "Veg Pahadi", "category": "Special Veg", "price": "200", "name_marathi": "व्हेज पहाडी" },
  { "name": "Veg Maratha", "category": "Special Veg", "price": "180", "name_marathi": "व्हेज मराठा" },
  { "name": "Navratan Korma", "category": "Special Veg", "price": "220", "name_marathi": "नवरतन कोरमा" },
  { "name": "Veg Jalfrezi", "category": "Special Veg", "price": "200", "name_marathi": "व्हेज जालफ्रेझी" },
  { "name": "Paneer Masala", "category": "Paneer Special", "price": "180", "name_marathi": "पनीर मसाला" },
  { "name": "Paneer Butter Masala", "category": "Paneer Special", "price": "190", "name_marathi": "पनीर बटर मसाला" },
  { "name": "Palak Paneer", "category": "Paneer Special", "price": "180", "name_marathi": "पालक पनीर" },
  { "name": "Cheese Butter Masala", "category": "Paneer Special", "price": "220", "name_marathi": "चीज बटर मसाला" },
  { "name": "Paneer Kesari", "category": "Paneer Special", "price": "280", "name_marathi": "पनीर केसरी" },
  { "name": "Paneer Fusion Tadka", "category": "Paneer Special", "price": "520", "name_marathi": "पनीर फ्युजन तडका" },
  { "name": "Malai Paneer", "category": "Paneer Special", "price": "250", "name_marathi": "मलाई पनीर" },
  { "name": "Paneer Handi - 3 Plates", "category": "Paneer Special", "price": "570", "name_marathi": "पनीर हंडी - 3 प्लेट्स" },
  { "name": "Paneer Angara", "category": "Paneer Special", "price": "250", "name_marathi": "पनीर अंगारा" },
  { "name": "Paneer Mumtaz", "category": "Paneer Special", "price": "400", "name_marathi": "पनीर मुमताज" },
  { "name": "Paneer Toofani", "category": "Paneer Special", "price": "270", "name_marathi": "पनीर तुफानी" },
  { "name": "Paneer Pasanda", "category": "Paneer Special", "price": "280", "name_marathi": "पनीर पासंडा" },
  { "name": "Moti Matar Paneer", "category": "Paneer Special", "price": "300", "name_marathi": "मोती मटर पनीर" },
  { "name": "Paneer Afghani Handi - 3 Plates", "category": "Paneer Special", "price": "570", "name_marathi": "पनीर अफगाणी हंडी - 3 प्लेट्स" },
  { "name": "Paneer Tikka Masala", "category": "Paneer Special", "price": "220", "name_marathi": "पनीर टिक्का मसाला" },
  { "name": "Vispute Special Red White Green Gravy", "category": "Paneer Special", "price": "600", "name_marathi": "विसपुते स्पेशल लाल पांढरी हिरवी ग्रेव्ही" },
  { "name": "Paneer Maratha", "category": "Paneer Special", "price": "230", "name_marathi": "पनीर मराठा" },
  { "name": "Paneer Lababdar", "category": "Paneer Special", "price": "250", "name_marathi": "पनीर लबाबदार" },
  { "name": "Paneer Koliwada", "category": "Paneer Special", "price": "250", "name_marathi": "पनीर कोळीवाडा" },
  { "name": "Paneer Kaleji", "category": "Paneer Special", "price": "280", "name_marathi": "पनीर कालेजी" },
  { "name": "Kaju Paneer Masala", "category": "Paneer Special", "price": "220", "name_marathi": "काजू पनीर मसाला" },
  { "name": "Paneer Malai Kofta", "category": "Paneer Special", "price": "280", "name_marathi": "पनीर मलाई कोफ्ता" },
  { "name": "Kadai Paneer", "category": "Paneer Special", "price": "200", "name_marathi": "कढई पनीर" },
  { "name": "Shahi Paneer", "category": "Paneer Special", "price": "200", "name_marathi": "शाही पनीर" },
  { "name": "Paneer Bhurji", "category": "Paneer Special", "price": "200", "name_marathi": "पनीर भुर्जी" },
  { "name": "Chole Paneer", "category": "Paneer Special", "price": "220", "name_marathi": "छोले पनीर" },
  { "name": "Veg Diwani Handi - 3 Plates", "category": "Paneer Special", "price": "600", "name_marathi": "व्हेज दिवाणी हंडी - 3 प्लेट्स" },
  { "name": "Tawa Roti", "category": "Roti", "price": "15", "name_marathi": "तवा रोटी" },
  { "name": "Tandoor Roti", "category": "Roti", "price": "12", "name_marathi": "तंदूर रोटी" },
  { "name": "Butter Roti", "category": "Roti", "price": "20", "name_marathi": "बटर रोटी" },
  { "name": "Bhakri", "category": "Roti", "price": "20", "name_marathi": "भाकरी" },
  { "name": "Butter Bhakri", "category": "Roti", "price": "25", "name_marathi": "लोणी भाकरी" },
  { "name": "Butter Naan", "category": "Roti", "price": "40", "name_marathi": "बटर नान" },
  { "name": "Garlic Naan", "category": "Roti", "price": "50", "name_marathi": "लसूण नान" },
  { "name": "Cheese Garlic Naan", "category": "Roti", "price": "60", "name_marathi": "चीज लसूण नान" },
  { "name": "Butter Kulcha", "category": "Roti", "price": "50", "name_marathi": "लोणी कुलचा" },
  { "name": "Lachha Paratha", "category": "Roti", "price": "50", "name_marathi": "लच्छा पराठा" },
  { "name": "Biryani Special Cream Rice - Half", "category": "Biryani and Rice", "price": "70", "name_marathi": "बिर्याणी स्पेशल क्रीम राइस - अर्धा" },
  { "name": "Biryani Special Cream Rice - Full", "category": "Biryani and Rice", "price": "120", "name_marathi": "बिर्याणी स्पेशल क्रीम राइस - फुल" },
  { "name": "Veg Biryani", "category": "Biryani and Rice", "price": "250", "name_marathi": "व्हेज बिर्याणी" },
  { "name": "Jeera Rice - Half", "category": "Biryani and Rice", "price": "80", "name_marathi": "जिरा तांदूळ - अर्धा" },
  { "name": "Jeera Rice - Full", "category": "Biryani and Rice", "price": "130", "name_marathi": "जिरा तांदूळ - पूर्ण" },
  { "name": "Dum Biryani", "category": "Biryani and Rice", "price": "280", "name_marathi": "दम बिर्याणी" },
  { "name": "Biryani Rice", "category": "Biryani and Rice", "price": "140", "name_marathi": "बिर्याणी भात" },
  { "name": "Hyderabadi Biryani", "category": "Biryani and Rice", "price": "250", "name_marathi": "हैदराबादी बिर्याणी" },
  { "name": "Lemon Rice", "category": "Biryani and Rice", "price": "140", "name_marathi": "लिंबू भात" },
  { "name": "Paneer Tikka Biryani", "category": "Biryani and Rice", "price": "300", "name_marathi": "पनीर टिक्का बिर्याणी" },
  { "name": "Butter Dal Khichdi", "category": "Biryani and Rice", "price": "150", "name_marathi": "बटर डाळ खिचडी" },
  { "name": "Kaju Paneer Biryani", "category": "Biryani and Rice", "price": "350", "name_marathi": "काजू पनीर बिर्याणी" },
  { "name": "Masala Rice", "category": "Biryani and Rice", "price": "160", "name_marathi": "मसाला भात" },
  { "name": "Malai Paneer Biryani", "category": "Biryani and Rice", "price": "350", "name_marathi": "मलाई पनीर बिर्याणी" },
  { "name": "Veg Pulao", "category": "Biryani and Rice", "price": "180", "name_marathi": "व्हेज पुलाव" },
  { "name": "Paneer Matka Biryani", "category": "Biryani and Rice", "price": "450", "name_marathi": "पनीर मटका बिर्याणी" },
  { "name": "Kashmiri Pulao", "category": "Biryani and Rice", "price": "200", "name_marathi": "काश्मिरी पुलाव" },
  { "name": "Paneer Pulao", "category": "Biryani and Rice", "price": "220", "name_marathi": "पनीर पुलाव" },
  { "name": "Tawa Pulao", "category": "Biryani and Rice", "price": "200", "name_marathi": "तवा पुलाव" }
]

// Category metadata with Marathi translations and icons
const categoryMeta = {
  "Papad": { name_mr: "पापड", sort_order: 1, icon: "🫓" },
  "Momos": { name_mr: "मोमोज", sort_order: 2, icon: "🥟" },
  "Soup": { name_mr: "सूप", sort_order: 3, icon: "🥣" },
  "Beverages": { name_mr: "पेये व ताक", sort_order: 4, icon: "🥛" },
  "Indian Starter": { name_mr: "इंडियन स्टार्टर", sort_order: 5, icon: "🍟" },
  "Tandoor Starter": { name_mr: "तंदूर स्टार्टर", sort_order: 6, icon: "🍢" },
  "Chinese Starter": { name_mr: "चायनीज स्टार्टर", sort_order: 7, icon: "🥢" },
  "Noodles": { name_mr: "नूडल्स", sort_order: 8, icon: "🍜" },
  "Chinese Rice": { name_mr: "चायनीज राईस", sort_order: 9, icon: "🥡" },
  "Veg Bahar": { name_mr: "व्हेज बहार (भाज्या)", sort_order: 10, icon: "🥘" },
  "Special Veg": { name_mr: "स्पेशल व्हेज", sort_order: 11, icon: "🍲" },
  "Paneer Special": { name_mr: "पनीर स्पेशल", sort_order: 12, icon: "🧀" },
  "Roti": { name_mr: "रोटी व भाकरी", sort_order: 13, icon: "🥖" },
  "Biryani and Rice": { name_mr: "बिर्याणी व भात", sort_order: 14, icon: "🍚" }
}

// Category image map
const categoryImages = {
  "Papad": "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500&auto=format&fit=crop&q=80",
  "Momos": "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=500&auto=format&fit=crop&q=80",
  "Soup": "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=500&auto=format&fit=crop&q=80",
  "Beverages": "https://images.unsplash.com/photo-1556881286-fc6915169721?w=500&auto=format&fit=crop&q=80",
  "Indian Starter": "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500&auto=format&fit=crop&q=80",
  "Tandoor Starter": "https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=500&auto=format&fit=crop&q=80",
  "Chinese Starter": "https://images.unsplash.com/photo-1541696432-82c6da8ce7bf?w=500&auto=format&fit=crop&q=80",
  "Noodles": "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=500&auto=format&fit=crop&q=80",
  "Chinese Rice": "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=500&auto=format&fit=crop&q=80",
  "Veg Bahar": "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&auto=format&fit=crop&q=80",
  "Special Veg": "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=500&auto=format&fit=crop&q=80",
  "Paneer Special": "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=500&auto=format&fit=crop&q=80",
  "Roti": "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=500&auto=format&fit=crop&q=80",
  "Biryani and Rice": "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&auto=format&fit=crop&q=80"
}

async function runSeed() {
  const client = new MongoClient(uri)
  try {
    await client.connect()
    console.log('Connected to Atlas...')
    const db = client.db('vispute')

    // 1. Categories
    const categoriesCol = db.collection('categories')
    await categoriesCol.deleteMany({})

    const distinctCats = [...new Set(rawItems.map(i => i.category))]
    const catDocs = distinctCats.map((cat, idx) => {
      const slug = cat.toLowerCase().replace(/[^a-z0-9]+/g, '-')
      const meta = categoryMeta[cat] || { name_mr: cat, sort_order: idx + 1, icon: '🍽️' }
      return {
        slug,
        name_en: cat,
        name_mr: meta.name_mr,
        sort_order: meta.sort_order,
        icon: meta.icon
      }
    })
    catDocs.sort((a, b) => a.sort_order - b.sort_order)
    await categoriesCol.insertMany(catDocs)
    console.log(`✓ Inserted ${catDocs.length} categories`)

    // 2. Menu Items
    const itemsCol = db.collection('menu_items')
    await itemsCol.deleteMany({})

    const itemDocs = rawItems.map((item, idx) => {
      const catSlug = item.category.toLowerCase().replace(/[^a-z0-9]+/g, '-')
      return {
        name_en: item.name,
        name_mr: item.name_marathi,
        category_slug: catSlug,
        category_name: item.category,
        price: parseFloat(item.price),
        is_veg: true,
        is_available: true,
        image_url: categoryImages[item.category] || categoryImages["Special Veg"],
        sort_order: idx + 1,
        created_at: new Date()
      }
    })

    await itemsCol.insertMany(itemDocs)
    console.log(`✓ Inserted ${itemDocs.length} menu items from the official Hotel Vispute menu!`)

    // Verify
    const count = await itemsCol.countDocuments()
    console.log(`Total menu items verified in Atlas: ${count}`)
  } catch (err) {
    console.error('Error seeding menu:', err)
  } finally {
    await client.close()
  }
}

runSeed()
