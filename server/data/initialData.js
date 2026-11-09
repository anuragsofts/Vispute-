const IMAGES = {
  "papadMasala": "https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=500&auto=format&fit=crop&q=60",
  "papadRoast": "https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=500&auto=format&fit=crop&q=60",
  "momos": "https://images.unsplash.com/photo-1625220194771-7ebdea0b70b9?w=500&auto=format&fit=crop&q=60",
  "soupTomato": "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=500&auto=format&fit=crop&q=60",
  "soupDark": "https://images.unsplash.com/photo-1603105037880-880cd4edfb0d?w=500&auto=format&fit=crop&q=60",
  "chaas": "https://images.unsplash.com/photo-1556881286-fc6915169721?w=500&auto=format&fit=crop&q=60",
  "frenchFries": "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=500&auto=format&fit=crop&q=60",
  "pakoda": "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500&auto=format&fit=crop&q=60",
  "paneerTikka": "https://images.unsplash.com/photo-1666001120694-3ebe8fd207be?w=500&auto=format&fit=crop&q=60",
  "tandoorPlatter": "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=500&auto=format&fit=crop&q=60",
  "seekhKabab": "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=500&auto=format&fit=crop&q=60",
  "manchurian": "https://images.unsplash.com/photo-1525755662778-989d0524087e?w=500&auto=format&fit=crop&q=60",
  "springRoll": "https://images.unsplash.com/photo-1544025162-d76694265947?w=500&auto=format&fit=crop&q=60",
  "sizzler": "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500&auto=format&fit=crop&q=60",
  "crispyStarter": "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=500&auto=format&fit=crop&q=60",
  "noodles": "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=500&auto=format&fit=crop&q=60",
  "friedRice": "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=500&auto=format&fit=crop&q=60",
  "dalTadka": "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&auto=format&fit=crop&q=60",
  "paneerButter": "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=500&auto=format&fit=crop&q=60",
  "richCurry": "https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=500&auto=format&fit=crop&q=60",
  "naanRoti": "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=500&auto=format&fit=crop&q=60",
  "biryani": "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&auto=format&fit=crop&q=60",
  "matkaBiryani": "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=500&auto=format&fit=crop&q=60"
};
function getImageForDish(cat, enName) {
  const name = enName.toLowerCase();
  if (cat === 'Papad') {
    return name.includes('masala') ? IMAGES.papadMasala : IMAGES.papadRoast;
  }
  if (cat === 'Momos') return IMAGES.momos;
  if (cat === 'Soup') {
    return name.includes('tomato') ? IMAGES.soupTomato : IMAGES.soupDark;
  }
  if (cat === 'Beverages') return IMAGES.chaas;
  if (cat === 'Indian Starter') {
    if (name.includes('finger') || name.includes('chips')) return IMAGES.frenchFries;
    if (name.includes('pakoda')) return IMAGES.paneerTikka;
    return IMAGES.pakoda;
  }
  if (cat === 'Tandoor Starter') {
    if (name.includes('platter')) return IMAGES.tandoorPlatter;
    if (name.includes('kabab')) return IMAGES.seekhKabab;
    if (name.includes('roll')) return IMAGES.springRoll;
    return IMAGES.paneerTikka;
  }
  if (cat === 'Chinese Starter') {
    if (name.includes('sizzler')) return IMAGES.sizzler;
    if (name.includes('roll')) return IMAGES.springRoll;
    if (name.includes('65') || name.includes('crispy') || name.includes('ball') || name.includes('coin')) return IMAGES.crispyStarter;
    return IMAGES.manchurian;
  }
  if (cat === 'Noodles') return IMAGES.noodles;
  if (cat === 'Chinese Rice') return IMAGES.friedRice;
  if (cat === 'Veg Bahar') {
    if (name.includes('dal')) return IMAGES.dalTadka;
    return IMAGES.richCurry;
  }
  if (cat === 'Special Veg') {
    if (name.includes('kaju')) return IMAGES.dalTadka;
    return IMAGES.richCurry;
  }
  if (cat === 'Paneer Special') {
    return IMAGES.paneerButter;
  }
  if (cat === 'Roti') return IMAGES.naanRoti;
  if (cat === 'Biryani and Rice') {
    if (name.includes('matka') || name.includes('dum')) return IMAGES.matkaBiryani;
    if (name.includes('rice') || name.includes('khichdi') || name.includes('pulao')) return IMAGES.dalTadka;
    return IMAGES.biryani;
  }
  return IMAGES.richCurry;
};

// Authentic Vispute Food Court Menu & Tables Data

const rawMenuData = [
  // Papad
  { category: "Papad", categoryMr: "पापड", en: "Udid Roast", mr: "उडीद भाजणे", price: 20, img: "https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=500&auto=format&fit=crop&q=60" },
  { category: "Papad", categoryMr: "पापड", en: "Udid Fry", mr: "उडीद तळणे", price: 20, img: "https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=500&auto=format&fit=crop&q=60" },
  { category: "Papad", categoryMr: "पापड", en: "Udid Masala", mr: "उडीद मसाला", price: 30, img: "https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=500&auto=format&fit=crop&q=60" },
  { category: "Papad", categoryMr: "पापड", en: "Nagali Roast", mr: "नागली भाजणे", price: 20, img: "https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=500&auto=format&fit=crop&q=60" },
  { category: "Papad", categoryMr: "पापड", en: "Nagali Fry", mr: "नागली फ्राय", price: 25, img: "https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=500&auto=format&fit=crop&q=60" },
  { category: "Papad", categoryMr: "पापड", en: "Nagali Masala", mr: "नागली मसाला", price: 40, img: "https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=500&auto=format&fit=crop&q=60" },

  // Momos
  { category: "Momos", categoryMr: "मोमोज", en: "Paneer Momos", mr: "पनीर मोमोज", price: 130, img: "https://images.unsplash.com/photo-1625220194771-7ebdea0b70b9?w=500&auto=format&fit=crop&q=60" },
  { category: "Momos", categoryMr: "मोमोज", en: "Steam Momos", mr: "स्टीम मोमोज", price: 120, img: "https://images.unsplash.com/photo-1625220194771-7ebdea0b70b9?w=500&auto=format&fit=crop&q=60" },

  // Soup
  { category: "Soup", categoryMr: "सूप", en: "Tomato Soup", mr: "टोमॅटो सूप", price: 120, img: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=500&auto=format&fit=crop&q=60" },
  { category: "Soup", categoryMr: "सूप", en: "Manchow Soup", mr: "मांचो सूप", price: 100, img: "https://images.unsplash.com/photo-1603105037880-880cd4edfb0d?w=500&auto=format&fit=crop&q=60" },
  { category: "Soup", categoryMr: "सूप", en: "Manchurian Soup", mr: "मंचुरियन सूप", price: 110, img: "https://images.unsplash.com/photo-1603105037880-880cd4edfb0d?w=500&auto=format&fit=crop&q=60" },
  { category: "Soup", categoryMr: "सूप", en: "Garlic Soup", mr: "लसूण सूप", price: 110, img: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=500&auto=format&fit=crop&q=60" },
  { category: "Soup", categoryMr: "सूप", en: "Hot and Sour Soup", mr: "गरम आणि आंबट सूप", price: 110, img: "https://images.unsplash.com/photo-1603105037880-880cd4edfb0d?w=500&auto=format&fit=crop&q=60" },
  { category: "Soup", categoryMr: "सूप", en: "Mushroom Soup", mr: "मशरूम सूप", price: 150, img: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=500&auto=format&fit=crop&q=60" },
  { category: "Soup", categoryMr: "सूप", en: "Taiwan Soup", mr: "तैवान सूप", price: 180, img: "https://images.unsplash.com/photo-1603105037880-880cd4edfb0d?w=500&auto=format&fit=crop&q=60" },
  { category: "Soup", categoryMr: "सूप", en: "Veg Clear Soup", mr: "व्हेज क्लिअर सूप", price: 100, img: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=500&auto=format&fit=crop&q=60" },
  { category: "Soup", categoryMr: "सूप", en: "Lemon Coriander Soup", mr: "लिंबू कोथिंबीर सूप", price: 120, img: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=500&auto=format&fit=crop&q=60" },

  // Beverages
  { category: "Beverages", categoryMr: "पेये", en: "Chaas", mr: "चास / ताक", price: 20, img: "https://images.unsplash.com/photo-1556881286-fc6915169721?w=500&auto=format&fit=crop&q=60" },

  // Indian Starter
  { category: "Indian Starter", categoryMr: "इंडियन स्टार्टर्स", en: "Finger Chips", mr: "फिंगर चिप्स", price: 90, img: "https://images.unsplash.com/photo-1576107232684-1279f3908594?w=500&auto=format&fit=crop&q=60" },
  { category: "Indian Starter", categoryMr: "इंडियन स्टार्टर्स", en: "Paneer Pakoda", mr: "पनीर पकोडा", price: 180, img: "https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=500&auto=format&fit=crop&q=60" },
  { category: "Indian Starter", categoryMr: "इंडियन स्टार्टर्स", en: "Kanda Bhaji", mr: "कांदा भजी", price: 100, img: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500&auto=format&fit=crop&q=60" },

  // Tandoor Starter
  { category: "Tandoor Starter", categoryMr: "तंदूर स्टार्टर्स", en: "Paneer Lahori", mr: "पनीर लाहोरी", price: 299, img: "https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=500&auto=format&fit=crop&q=60" },
  { category: "Tandoor Starter", categoryMr: "तंदूर स्टार्टर्स", en: "Paneer Afghani Roll", mr: "पनीर अफगाणी रोल", price: 550, img: "https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=500&auto=format&fit=crop&q=60" },
  { category: "Tandoor Starter", categoryMr: "तंदूर स्टार्टर्स", en: "Paneer Parda", mr: "पनीर पर्दा", price: 550, img: "https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=500&auto=format&fit=crop&q=60" },
  { category: "Tandoor Starter", categoryMr: "तंदूर स्टार्टर्स", en: "Paneer Malai Tikka", mr: "पनीर मलाई टिक्का", price: 380, img: "https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=500&auto=format&fit=crop&q=60" },
  { category: "Tandoor Starter", categoryMr: "तंदूर स्टार्टर्स", en: "Paneer Pahadi Tikka", mr: "पनीर पहाडी टिक्का", price: 350, img: "https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=500&auto=format&fit=crop&q=60" },
  { category: "Tandoor Starter", categoryMr: "तंदूर स्टार्टर्स", en: "Paneer Banjara Tikka", mr: "पनीर बंजारा टिक्का", price: 350, img: "https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=500&auto=format&fit=crop&q=60" },
  { category: "Tandoor Starter", categoryMr: "तंदूर स्टार्टर्स", en: "Paneer Achari Tikka", mr: "पनीर आचारी टिक्का", price: 350, img: "https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=500&auto=format&fit=crop&q=60" },
  { category: "Tandoor Starter", categoryMr: "तंदूर स्टार्टर्स", en: "Paneer Matka", mr: "पनीर मटका", price: 580, img: "https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=500&auto=format&fit=crop&q=60" },
  { category: "Tandoor Starter", categoryMr: "तंदूर स्टार्टर्स", en: "Veg Rosala Dum Potato", mr: "व्हेज रोसाला दम बटाटा", price: 350, img: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&auto=format&fit=crop&q=60" },
  { category: "Tandoor Starter", categoryMr: "तंदूर स्टार्टर्स", en: "Veg Seekh Kabab", mr: "व्हेज सीख कबाब", price: 299, img: "https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=500&auto=format&fit=crop&q=60" },
  { category: "Tandoor Starter", categoryMr: "तंदूर स्टार्टर्स", en: "Veg Cheese Roll", mr: "व्हेज चीज रोल", price: 399, img: "https://images.unsplash.com/photo-1544025162-d76694265947?w=500&auto=format&fit=crop&q=60" },
  { category: "Tandoor Starter", categoryMr: "तंदूर स्टार्टर्स", en: "Tandoor Starter Platter", mr: "तंदूर स्टार्टर थाळी", price: 999, img: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=500&auto=format&fit=crop&q=60" },
  { category: "Tandoor Starter", categoryMr: "तंदूर स्टार्टर्स", en: "Baby Corn Tikka", mr: "बेबी कॉर्न टिक्का", price: 350, img: "https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=500&auto=format&fit=crop&q=60" },
  { category: "Tandoor Starter", categoryMr: "तंदूर स्टार्टर्स", en: "Mushroom Tikka", mr: "मशरूम टिक्का", price: 350, img: "https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=500&auto=format&fit=crop&q=60" },
  { category: "Tandoor Starter", categoryMr: "तंदूर स्टार्टर्स", en: "Stuffed Mushroom", mr: "चोंदलेले मशरूम", price: 450, img: "https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=500&auto=format&fit=crop&q=60" },
  { category: "Tandoor Starter", categoryMr: "तंदूर स्टार्टर्स", en: "Cheese Rumali Khakra", mr: "चीज रुमाली खाकरा", price: 180, img: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=500&auto=format&fit=crop&q=60" },

  // Chinese Starter
  { category: "Chinese Starter", categoryMr: "चायनीज स्टार्टर्स", en: "Soyabean Chilli", mr: "सोयाबीन मिरची", price: 100, img: "https://images.unsplash.com/photo-1525755662778-989d0524087e?w=500&auto=format&fit=crop&q=60" },
  { category: "Chinese Starter", categoryMr: "चायनीज स्टार्टर्स", en: "Veg Manchurian", mr: "व्हेज मंचुरियन", price: 120, img: "https://images.unsplash.com/photo-1525755662778-989d0524087e?w=500&auto=format&fit=crop&q=60" },
  { category: "Chinese Starter", categoryMr: "चायनीज स्टार्टर्स", en: "Veg Manchurian Gravy", mr: "व्हेज मंचुरियन ग्रेव्ही", price: 140, img: "https://images.unsplash.com/photo-1525755662778-989d0524087e?w=500&auto=format&fit=crop&q=60" },
  { category: "Chinese Starter", categoryMr: "चायनीज स्टार्टर्स", en: "Paneer Chilli", mr: "पनीर मिरची", price: 180, img: "https://images.unsplash.com/photo-1525755662778-989d0524087e?w=500&auto=format&fit=crop&q=60" },
  { category: "Chinese Starter", categoryMr: "चायनीज स्टार्टर्स", en: "Mushroom Chilli", mr: "मशरूम मिरची", price: 180, img: "https://images.unsplash.com/photo-1525755662778-989d0524087e?w=500&auto=format&fit=crop&q=60" },
  { category: "Chinese Starter", categoryMr: "चायनीज स्टार्टर्स", en: "Paneer Mexican", mr: "पनीर मेक्सिकन", price: 299, img: "https://images.unsplash.com/photo-1525755662778-989d0524087e?w=500&auto=format&fit=crop&q=60" },
  { category: "Chinese Starter", categoryMr: "चायनीज स्टार्टर्स", en: "Paneer Sizzler", mr: "पनीर सिझलर", price: 499, img: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500&auto=format&fit=crop&q=60" },
  { category: "Chinese Starter", categoryMr: "चायनीज स्टार्टर्स", en: "Paneer Steak Sizzler", mr: "पनीर स्टीक सिझलर", price: 550, img: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500&auto=format&fit=crop&q=60" },
  { category: "Chinese Starter", categoryMr: "चायनीज स्टार्टर्स", en: "Paneer Forest", mr: "पनीरचे जंगल", price: 499, img: "https://images.unsplash.com/photo-1525755662778-989d0524087e?w=500&auto=format&fit=crop&q=60" },
  { category: "Chinese Starter", categoryMr: "चायनीज स्टार्टर्स", en: "American Chopsuey", mr: "अमेरिकन चॉप्सुए", price: 350, img: "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=500&auto=format&fit=crop&q=60" },
  { category: "Chinese Starter", categoryMr: "चायनीज स्टार्टर्स", en: "Paneer Satay", mr: "पनीर साटे", price: 399, img: "https://images.unsplash.com/photo-1525755662778-989d0524087e?w=500&auto=format&fit=crop&q=60" },
  { category: "Chinese Starter", categoryMr: "चायनीज स्टार्टर्स", en: "Paneer 65", mr: "पनीर 65", price: 199, img: "https://images.unsplash.com/photo-1525755662778-989d0524087e?w=500&auto=format&fit=crop&q=60" },
  { category: "Chinese Starter", categoryMr: "चायनीज स्टार्टर्स", en: "Paneer Crispy", mr: "पनीर कुरकुरीत", price: 199, img: "https://images.unsplash.com/photo-1525755662778-989d0524087e?w=500&auto=format&fit=crop&q=60" },
  { category: "Chinese Starter", categoryMr: "चायनीज स्टार्टर्स", en: "Veg Spring Roll", mr: "व्हेज स्प्रिंग रोल", price: 150, img: "https://images.unsplash.com/photo-1544025162-d76694265947?w=500&auto=format&fit=crop&q=60" },
  { category: "Chinese Starter", categoryMr: "चायनीज स्टार्टर्स", en: "Veg Lollipop", mr: "व्हेज लॉलीपॉप", price: 199, img: "https://images.unsplash.com/photo-1525755662778-989d0524087e?w=500&auto=format&fit=crop&q=60" },
  { category: "Chinese Starter", categoryMr: "चायनीज स्टार्टर्स", en: "Cheese Corn Tikka", mr: "चीज कॉर्न टिक्का", price: 299, img: "https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=500&auto=format&fit=crop&q=60" },
  { category: "Chinese Starter", categoryMr: "चायनीज स्टार्टर्स", en: "Cheese Ball", mr: "चीज बॉल", price: 299, img: "https://images.unsplash.com/photo-1544025162-d76694265947?w=500&auto=format&fit=crop&q=60" },
  { category: "Chinese Starter", categoryMr: "चायनीज स्टार्टर्स", en: "Veg Golden Coin", mr: "व्हेज गोल्डन कॉईन", price: 220, img: "https://images.unsplash.com/photo-1544025162-d76694265947?w=500&auto=format&fit=crop&q=60" },
  { category: "Chinese Starter", categoryMr: "चायनीज स्टार्टर्स", en: "Veg Shehni Roll", mr: "व्हेज शेहनी रोल", price: 250, img: "https://images.unsplash.com/photo-1544025162-d76694265947?w=500&auto=format&fit=crop&q=60" },

  // Noodles
  { category: "Noodles", categoryMr: "नूडल्स", en: "Chinese Bhel", mr: "चायनीज भेळ", price: 150, img: "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=500&auto=format&fit=crop&q=60" },
  { category: "Noodles", categoryMr: "नूडल्स", en: "Hakka Noodles", mr: "हक्का नूडल्स", price: 130, img: "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=500&auto=format&fit=crop&q=60" },
  { category: "Noodles", categoryMr: "नूडल्स", en: "Schezwan Noodles", mr: "शेझवान नूडल्स", price: 150, img: "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=500&auto=format&fit=crop&q=60" },
  { category: "Noodles", categoryMr: "नूडल्स", en: "Triple Noodles", mr: "ट्रिपल नूडल्स", price: 250, img: "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=500&auto=format&fit=crop&q=60" },
  { category: "Noodles", categoryMr: "नूडल्स", en: "Singapore Noodles", mr: "सिंगापूर नूडल्स", price: 180, img: "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=500&auto=format&fit=crop&q=60" },
  { category: "Noodles", categoryMr: "नूडल्स", en: "Manchurian Noodles", mr: "मंचुरियन नूडल्स", price: 180, img: "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=500&auto=format&fit=crop&q=60" },
  { category: "Noodles", categoryMr: "नूडल्स", en: "Paneer Noodles", mr: "पनीर नूडल्स", price: 220, img: "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=500&auto=format&fit=crop&q=60" },
  { category: "Noodles", categoryMr: "नूडल्स", en: "Mushroom Noodles", mr: "मशरूम नूडल्स", price: 200, img: "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=500&auto=format&fit=crop&q=60" },

  // Chinese Rice
  { category: "Chinese Rice", categoryMr: "चायनीज भात", en: "Fried Rice", mr: "तळलेले तांदूळ / फ्राईड राइस", price: 140, img: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=500&auto=format&fit=crop&q=60" },
  { category: "Chinese Rice", categoryMr: "चायनीज भात", en: "Paneer Fried Rice", mr: "पनीर फ्राईड राइस", price: 220, img: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=500&auto=format&fit=crop&q=60" },
  { category: "Chinese Rice", categoryMr: "चायनीज भात", en: "Schezwan Rice", mr: "शेझवान तांदूळ", price: 160, img: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=500&auto=format&fit=crop&q=60" },
  { category: "Chinese Rice", categoryMr: "चायनीज भात", en: "Singapore Rice", mr: "सिंगापूर तांदूळ", price: 180, img: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=500&auto=format&fit=crop&q=60" },
  { category: "Chinese Rice", categoryMr: "चायनीज भात", en: "Manchurian Rice", mr: "मंचुरियन भात", price: 180, img: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=500&auto=format&fit=crop&q=60" },
  { category: "Chinese Rice", categoryMr: "चायनीज भात", en: "Triple Rice", mr: "तिप्पट तांदूळ / ट्रिपल राइस", price: 250, img: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=500&auto=format&fit=crop&q=60" },
  { category: "Chinese Rice", categoryMr: "चायनीज भात", en: "Mushroom Rice", mr: "मशरूम तांदूळ", price: 200, img: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=500&auto=format&fit=crop&q=60" },

  // Veg Bahar
  { category: "Veg Bahar", categoryMr: "व्हेज बहार", en: "Shev Bhaji", mr: "शेवभाजी", price: 100, img: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&auto=format&fit=crop&q=60" },
  { category: "Veg Bahar", categoryMr: "व्हेज बहार", en: "Shev Tadka", mr: "शेव तडका", price: 120, img: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&auto=format&fit=crop&q=60" },
  { category: "Veg Bahar", categoryMr: "व्हेज बहार", en: "Shev Tomato", mr: "शेव टोमॅटो", price: 120, img: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&auto=format&fit=crop&q=60" },
  { category: "Veg Bahar", categoryMr: "व्हेज बहार", en: "Special Shev Bhaji", mr: "स्पेशल शेवभाजी", price: 150, img: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&auto=format&fit=crop&q=60" },
  { category: "Veg Bahar", categoryMr: "व्हेज बहार", en: "Dal Fry", mr: "डाळ फ्राय", price: 110, img: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&auto=format&fit=crop&q=60" },
  { category: "Veg Bahar", categoryMr: "व्हेज बहार", en: "Dal Tadka", mr: "दाल तडका", price: 120, img: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&auto=format&fit=crop&q=60" },
  { category: "Veg Bahar", categoryMr: "व्हेज बहार", en: "Soyabean Masala", mr: "सोयाबीन मसाला", price: 110, img: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&auto=format&fit=crop&q=60" },
  { category: "Veg Bahar", categoryMr: "व्हेज बहार", en: "Baingan Masala", mr: "बैंगन मसाला", price: 120, img: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&auto=format&fit=crop&q=60" },
  { category: "Veg Bahar", categoryMr: "व्हेज बहार", en: "Bhaji Amti", mr: "भजी आमटी", price: 110, img: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&auto=format&fit=crop&q=60" },
  { category: "Veg Bahar", categoryMr: "व्हेज बहार", en: "Chana Masala", mr: "चना मसाला", price: 120, img: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&auto=format&fit=crop&q=60" },
  { category: "Veg Bahar", categoryMr: "व्हेज बहार", en: "Shevga Masala", mr: "शेवगा मसाला", price: 120, img: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&auto=format&fit=crop&q=60" },
  { category: "Veg Bahar", categoryMr: "व्हेज बहार", en: "Besan Pithla", mr: "बेसन पिठला", price: 110, img: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&auto=format&fit=crop&q=60" },
  { category: "Veg Bahar", categoryMr: "व्हेज बहार", en: "Bhindi Masala", mr: "भिंडी मसाला", price: 120, img: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&auto=format&fit=crop&q=60" },
  { category: "Veg Bahar", categoryMr: "व्हेज बहार", en: "Methi Pithla", mr: "मेथी पिठला", price: 120, img: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&auto=format&fit=crop&q=60" },
  { category: "Veg Bahar", categoryMr: "व्हेज बहार", en: "Methi Masala", mr: "मेथी मसाला", price: 120, img: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&auto=format&fit=crop&q=60" },
  { category: "Veg Bahar", categoryMr: "व्हेज बहार", en: "Aloo Matar", mr: "आलू मातर", price: 150, img: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&auto=format&fit=crop&q=60" },
  { category: "Veg Bahar", categoryMr: "व्हेज बहार", en: "Lasoon Methi", mr: "लसून मेथी", price: 150, img: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&auto=format&fit=crop&q=60" },
  { category: "Veg Bahar", categoryMr: "व्हेज बहार", en: "Aloo Jeera", mr: "आलू जीरा", price: 120, img: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&auto=format&fit=crop&q=60" },
  { category: "Veg Bahar", categoryMr: "व्हेज बहार", en: "Malai Methi", mr: "मलाई मेथी", price: 150, img: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&auto=format&fit=crop&q=60" },
  { category: "Veg Bahar", categoryMr: "व्हेज बहार", en: "Lasoon Palak", mr: "लासून पालक", price: 150, img: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&auto=format&fit=crop&q=60" },
  { category: "Veg Bahar", categoryMr: "व्हेज बहार", en: "Green Palak", mr: "हिरवी पालक", price: 120, img: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&auto=format&fit=crop&q=60" },
  { category: "Veg Bahar", categoryMr: "व्हेज बहार", en: "Tomato Chutney", mr: "टोमॅटो चटणी", price: 110, img: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&auto=format&fit=crop&q=60" },
  { category: "Veg Bahar", categoryMr: "व्हेज बहार", en: "Mirchi Thecha", mr: "मिर्ची थेचा", price: 80, img: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&auto=format&fit=crop&q=60" },
  { category: "Veg Bahar", categoryMr: "व्हेज बहार", en: "Papad Churi", mr: "पापड चुरी", price: 110, img: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500&auto=format&fit=crop&q=60" },

  // Special Veg
  { category: "Special Veg", categoryMr: "स्पेशल व्हेज", en: "Kaju Masala", mr: "काजू मसाला", price: 200, img: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&auto=format&fit=crop&q=60" },
  { category: "Special Veg", categoryMr: "स्पेशल व्हेज", en: "Kaju Curry Sweet", mr: "काजू करी गोड", price: 250, img: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&auto=format&fit=crop&q=60" },
  { category: "Special Veg", categoryMr: "स्पेशल व्हेज", en: "Kaju Angara", mr: "काजू अंगारा", price: 250, img: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&auto=format&fit=crop&q=60" },
  { category: "Special Veg", categoryMr: "स्पेशल व्हेज", en: "Kaju Mushroom Masala", mr: "काजू मशरूम मसाला", price: 220, img: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&auto=format&fit=crop&q=60" },
  { category: "Special Veg", categoryMr: "स्पेशल व्हेज", en: "Mushroom Masala", mr: "मशरूम मसाला", price: 180, img: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&auto=format&fit=crop&q=60" },
  { category: "Special Veg", categoryMr: "स्पेशल व्हेज", en: "Veg Angara", mr: "व्हेज अंगारा", price: 240, img: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&auto=format&fit=crop&q=60" },
  { category: "Special Veg", categoryMr: "स्पेशल व्हेज", en: "Veg Khazana", mr: "व्हेज खजाना", price: 180, img: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&auto=format&fit=crop&q=60" },
  { category: "Special Veg", categoryMr: "स्पेशल व्हेज", en: "Veg Hyderabadi", mr: "हैदराबादी व्हेज", price: 170, img: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&auto=format&fit=crop&q=60" },
  { category: "Special Veg", categoryMr: "स्पेशल व्हेज", en: "Veg Lahori", mr: "लाहोरी व्हेज", price: 160, img: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&auto=format&fit=crop&q=60" },
  { category: "Special Veg", categoryMr: "स्पेशल व्हेज", en: "Veg Kolhapuri", mr: "व्हेज कोल्हापुरी", price: 120, img: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&auto=format&fit=crop&q=60" },
  { category: "Special Veg", categoryMr: "स्पेशल व्हेज", en: "Cheese Mushroom Masala", mr: "चीज मशरूम मसाला", price: 250, img: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&auto=format&fit=crop&q=60" },
  { category: "Special Veg", categoryMr: "स्पेशल व्हेज", en: "Mix Veg", mr: "मिक्स व्हेज", price: 110, img: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&auto=format&fit=crop&q=60" },
  { category: "Special Veg", categoryMr: "स्पेशल व्हेज", en: "Malai Kofta", mr: "मलाई कोफ्ता", price: 250, img: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&auto=format&fit=crop&q=60" },
  { category: "Special Veg", categoryMr: "स्पेशल व्हेज", en: "Veg Kadai", mr: "व्हेज कढई", price: 180, img: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&auto=format&fit=crop&q=60" },
  { category: "Special Veg", categoryMr: "स्पेशल व्हेज", en: "Veg Kofta", mr: "व्हेज कोफ्ता", price: 220, img: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&auto=format&fit=crop&q=60" },
  { category: "Special Veg", categoryMr: "स्पेशल व्हेज", en: "Veg Patiala", mr: "व्हेज पटियाला", price: 200, img: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&auto=format&fit=crop&q=60" },
  { category: "Special Veg", categoryMr: "स्पेशल व्हेज", en: "Veg Jaipuri", mr: "व्हेज जयपुरी", price: 180, img: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&auto=format&fit=crop&q=60" },
  { category: "Special Veg", categoryMr: "स्पेशल व्हेज", en: "Veg Bhuna", mr: "व्हेज भुना", price: 180, img: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&auto=format&fit=crop&q=60" },
  { category: "Special Veg", categoryMr: "स्पेशल व्हेज", en: "Veg Maharaja", mr: "व्हेज महाराजा", price: 200, img: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&auto=format&fit=crop&q=60" },
  { category: "Special Veg", categoryMr: "स्पेशल व्हेज", en: "Veg Pahadi", mr: "व्हेज पहाडी", price: 200, img: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&auto=format&fit=crop&q=60" },
  { category: "Special Veg", categoryMr: "स्पेशल व्हेज", en: "Veg Maratha", mr: "व्हेज मराठा", price: 180, img: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&auto=format&fit=crop&q=60" },
  { category: "Special Veg", categoryMr: "स्पेशल व्हेज", en: "Navratan Korma", mr: "नवरतन कोरमा", price: 220, img: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&auto=format&fit=crop&q=60" },
  { category: "Special Veg", categoryMr: "स्पेशल व्हेज", en: "Veg Jalfrezi", mr: "व्हेज जालफ्रेझी", price: 200, img: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&auto=format&fit=crop&q=60" },

  // Paneer Special
  { category: "Paneer Special", categoryMr: "पनीर स्पेशल", en: "Paneer Masala", mr: "पनीर मसाला", price: 180, img: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=500&auto=format&fit=crop&q=60" },
  { category: "Paneer Special", categoryMr: "पनीर स्पेशल", en: "Paneer Butter Masala", mr: "पनीर बटर मसाला", price: 190, img: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=500&auto=format&fit=crop&q=60" },
  { category: "Paneer Special", categoryMr: "पनीर स्पेशल", en: "Palak Paneer", mr: "पालक पनीर", price: 180, img: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=500&auto=format&fit=crop&q=60" },
  { category: "Paneer Special", categoryMr: "पनीर स्पेशल", en: "Cheese Butter Masala", mr: "चीज बटर मसाला", price: 220, img: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=500&auto=format&fit=crop&q=60" },
  { category: "Paneer Special", categoryMr: "पनीर स्पेशल", en: "Paneer Kesari", mr: "पनीर केसरी", price: 280, img: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=500&auto=format&fit=crop&q=60" },
  { category: "Paneer Special", categoryMr: "पनीर स्पेशल", en: "Paneer Fusion Tadka", mr: "पनीर फ्युजन तडका", price: 520, img: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=500&auto=format&fit=crop&q=60" },
  { category: "Paneer Special", categoryMr: "पनीर स्पेशल", en: "Malai Paneer", mr: "मलाई पनीर", price: 250, img: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=500&auto=format&fit=crop&q=60" },
  { category: "Paneer Special", categoryMr: "पनीर स्पेशल", en: "Paneer Handi - 3 Plates", mr: "पनीर हंडी - 3 प्लेट्स", price: 570, img: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=500&auto=format&fit=crop&q=60" },
  { category: "Paneer Special", categoryMr: "पनीर स्पेशल", en: "Paneer Angara", mr: "पनीर अंगारा", price: 250, img: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=500&auto=format&fit=crop&q=60" },
  { category: "Paneer Special", categoryMr: "पनीर स्पेशल", en: "Paneer Mumtaz", mr: "पनीर मुमताज", price: 400, img: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=500&auto=format&fit=crop&q=60" },
  { category: "Paneer Special", categoryMr: "पनीर स्पेशल", en: "Paneer Toofani", mr: "पनीर तुफानी", price: 270, img: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=500&auto=format&fit=crop&q=60" },
  { category: "Paneer Special", categoryMr: "पनीर स्पेशल", en: "Paneer Pasanda", mr: "पनीर पासंडा", price: 280, img: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=500&auto=format&fit=crop&q=60" },
  { category: "Paneer Special", categoryMr: "पनीर स्पेशल", en: "Moti Matar Paneer", mr: "मोती मटर पनीर", price: 300, img: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=500&auto=format&fit=crop&q=60" },
  { category: "Paneer Special", categoryMr: "पनीर स्पेशल", en: "Paneer Afghani Handi - 3 Plates", mr: "पनीर अफगाणी हंडी - 3 प्लेट्स", price: 570, img: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=500&auto=format&fit=crop&q=60" },
  { category: "Paneer Special", categoryMr: "पनीर स्पेशल", en: "Paneer Tikka Masala", mr: "पनीर टिक्का मसाला", price: 220, img: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=500&auto=format&fit=crop&q=60" },
  { category: "Paneer Special", categoryMr: "पनीर स्पेशल", en: "Vispute Special Red White Green Gravy", mr: "विसपुते स्पेशल लाल पांढरी हिरवी ग्रेव्ही", price: 600, img: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=500&auto=format&fit=crop&q=60" },
  { category: "Paneer Special", categoryMr: "पनीर स्पेशल", en: "Paneer Maratha", mr: "पनीर मराठा", price: 230, img: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=500&auto=format&fit=crop&q=60" },
  { category: "Paneer Special", categoryMr: "पनीर स्पेशल", en: "Paneer Lababdar", mr: "पनीर लबाबदार", price: 250, img: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=500&auto=format&fit=crop&q=60" },
  { category: "Paneer Special", categoryMr: "पनीर स्पेशल", en: "Paneer Koliwada", mr: "पनीर कोळीवाडा", price: 250, img: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=500&auto=format&fit=crop&q=60" },
  { category: "Paneer Special", categoryMr: "पनीर स्पेशल", en: "Paneer Kaleji", mr: "पनीर कालेजी", price: 280, img: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=500&auto=format&fit=crop&q=60" },
  { category: "Paneer Special", categoryMr: "पनीर स्पेशल", en: "Kaju Paneer Masala", mr: "काजू पनीर मसाला", price: 220, img: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=500&auto=format&fit=crop&q=60" },
  { category: "Paneer Special", categoryMr: "पनीर स्पेशल", en: "Paneer Malai Kofta", mr: "पनीर मलाई कोफ्ता", price: 280, img: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=500&auto=format&fit=crop&q=60" },
  { category: "Paneer Special", categoryMr: "पनीर स्पेशल", en: "Kadai Paneer", mr: "कढई पनीर", price: 200, img: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=500&auto=format&fit=crop&q=60" },
  { category: "Paneer Special", categoryMr: "पनीर स्पेशल", en: "Shahi Paneer", mr: "शाही पनीर", price: 200, img: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=500&auto=format&fit=crop&q=60" },
  { category: "Paneer Special", categoryMr: "पनीर स्पेशल", en: "Paneer Bhurji", mr: "पनीर भुर्जी", price: 200, img: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=500&auto=format&fit=crop&q=60" },
  { category: "Paneer Special", categoryMr: "पनीर स्पेशल", en: "Chole Paneer", mr: "छोले पनीर", price: 220, img: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=500&auto=format&fit=crop&q=60" },
  { category: "Paneer Special", categoryMr: "पनीर स्पेशल", en: "Veg Diwani Handi - 3 Plates", mr: "व्हेज दिवाणी हंडी - 3 प्लेट्स", price: 600, img: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=500&auto=format&fit=crop&q=60" },

  // Roti
  { category: "Roti", categoryMr: "रोटी / भाकरी", en: "Tawa Roti", mr: "तवा रोटी", price: 15, img: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=500&auto=format&fit=crop&q=60" },
  { category: "Roti", categoryMr: "रोटी / भाकरी", en: "Tandoor Roti", mr: "तंदूर रोटी", price: 12, img: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=500&auto=format&fit=crop&q=60" },
  { category: "Roti", categoryMr: "रोटी / भाकरी", en: "Butter Roti", mr: "बटर रोटी", price: 20, img: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=500&auto=format&fit=crop&q=60" },
  { category: "Roti", categoryMr: "रोटी / भाकरी", en: "Bhakri", mr: "भाकरी", price: 20, img: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=500&auto=format&fit=crop&q=60" },
  { category: "Roti", categoryMr: "रोटी / भाकरी", en: "Butter Bhakri", mr: "लोणी भाकरी", price: 25, img: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=500&auto=format&fit=crop&q=60" },
  { category: "Roti", categoryMr: "रोटी / भाकरी", en: "Butter Naan", mr: "बटर नान", price: 40, img: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=500&auto=format&fit=crop&q=60" },
  { category: "Roti", categoryMr: "रोटी / भाकरी", en: "Garlic Naan", mr: "लसूण नान", price: 50, img: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=500&auto=format&fit=crop&q=60" },
  { category: "Roti", categoryMr: "रोटी / भाकरी", en: "Cheese Garlic Naan", mr: "चीज लसूण नान", price: 60, img: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=500&auto=format&fit=crop&q=60" },
  { category: "Roti", categoryMr: "रोटी / भाकरी", en: "Butter Kulcha", mr: "लोणी कुलचा", price: 50, img: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=500&auto=format&fit=crop&q=60" },
  { category: "Roti", categoryMr: "रोटी / भाकरी", en: "Lachha Paratha", mr: "लच्छा पराठा", price: 50, img: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=500&auto=format&fit=crop&q=60" },

  // Biryani and Rice
  { category: "Biryani and Rice", categoryMr: "बिर्याणी आणि भात", en: "Biryani Special Cream Rice - Half", mr: "बिर्याणी स्पेशल क्रीम राइस - अर्धा", price: 70, img: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&auto=format&fit=crop&q=60" },
  { category: "Biryani and Rice", categoryMr: "बिर्याणी आणि भात", en: "Biryani Special Cream Rice - Full", mr: "बिर्याणी स्पेशल क्रीम राइस - फुल", price: 120, img: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&auto=format&fit=crop&q=60" },
  { category: "Biryani and Rice", categoryMr: "बिर्याणी आणि भात", en: "Veg Biryani", mr: "व्हेज बिर्याणी", price: 250, img: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&auto=format&fit=crop&q=60" },
  { category: "Biryani and Rice", categoryMr: "बिर्याणी आणि भात", en: "Jeera Rice - Half", mr: "जिरा तांदूळ - अर्धा", price: 80, img: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&auto=format&fit=crop&q=60" },
  { category: "Biryani and Rice", categoryMr: "बिर्याणी आणि भात", en: "Jeera Rice - Full", mr: "जिरा तांदूळ - पूर्ण", price: 130, img: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&auto=format&fit=crop&q=60" },
  { category: "Biryani and Rice", categoryMr: "बिर्याणी आणि भात", en: "Dum Biryani", mr: "दम बिर्याणी", price: 280, img: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&auto=format&fit=crop&q=60" },
  { category: "Biryani and Rice", categoryMr: "बिर्याणी आणि भात", en: "Biryani Rice", mr: "बिर्याणी भात", price: 140, img: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&auto=format&fit=crop&q=60" },
  { category: "Biryani and Rice", categoryMr: "बिर्याणी आणि भात", en: "Hyderabadi Biryani", mr: "हैदराबादी बिर्याणी", price: 250, img: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&auto=format&fit=crop&q=60" },
  { category: "Biryani and Rice", categoryMr: "बिर्याणी आणि भात", en: "Lemon Rice", mr: "लिंबू भात", price: 140, img: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&auto=format&fit=crop&q=60" },
  { category: "Biryani and Rice", categoryMr: "बिर्याणी आणि भात", en: "Paneer Tikka Biryani", mr: "पनीर टिक्का बिर्याणी", price: 300, img: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&auto=format&fit=crop&q=60" },
  { category: "Biryani and Rice", categoryMr: "बिर्याणी आणि भात", en: "Butter Dal Khichdi", mr: "बटर डाळ खिचडी", price: 150, img: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&auto=format&fit=crop&q=60" },
  { category: "Biryani and Rice", categoryMr: "बिर्याणी आणि भात", en: "Kaju Paneer Biryani", mr: "काजू पनीर बिर्याणी", price: 350, img: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&auto=format&fit=crop&q=60" },
  { category: "Biryani and Rice", categoryMr: "बिर्याणी आणि भात", en: "Masala Rice", mr: "मसाला भात", price: 160, img: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&auto=format&fit=crop&q=60" },
  { category: "Biryani and Rice", categoryMr: "बिर्याणी आणि भात", en: "Malai Paneer Biryani", mr: "मलाई पनीर बिर्याणी", price: 350, img: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&auto=format&fit=crop&q=60" },
  { category: "Biryani and Rice", categoryMr: "बिर्याणी आणि भात", en: "Veg Pulao", mr: "व्हेज पुलाव", price: 180, img: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&auto=format&fit=crop&q=60" },
  { category: "Biryani and Rice", categoryMr: "बिर्याणी आणि भात", en: "Paneer Matka Biryani", mr: "पनीर मटका बिर्याणी", price: 450, img: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&auto=format&fit=crop&q=60" },
  { category: "Biryani and Rice", categoryMr: "बिर्याणी आणि भात", en: "Kashmiri Pulao", mr: "काश्मिरी पुलाव", price: 200, img: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&auto=format&fit=crop&q=60" },
  { category: "Biryani and Rice", categoryMr: "बिर्याणी आणि भात", en: "Paneer Pulao", mr: "पनीर पुलाव", price: 220, img: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&auto=format&fit=crop&q=60" },
  { category: "Biryani and Rice", categoryMr: "बिर्याणी आणि भात", en: "Tawa Pulao", mr: "तवा पुलाव", price: 200, img: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&auto=format&fit=crop&q=60" }
];

const initialMenu = rawMenuData.map((item, idx) => ({
  id: `vfc-m-${idx + 1}`,
  name: item.en,
  marathiName: item.mr,
  category: item.category,
  categoryMr: item.categoryMr,
  price: item.price,
  isVeg: true,
  rating: 4.8,
  description: `${item.mr} (${item.en}) - विस्पुते फूड कोर्ट स्पेशल`,
  image: getImageForDish(item.category, item.en),
  isAvailable: true,
  prepTime: "12 mins"
}));

// ONLY MAIN FLOOR TABLES (Table 1 to Table 12, matching the reference photo layout exactly). NO PATIO OR GARDEN.
const initialTables = [
  // Row 1
  {
    id: "T1",
    tableNumber: 1,
    name: "Table 1",
    section: "Main Floor",
    shape: "square",
    seats: 4,
    x: 420,
    y: 80,
    status: "occupied", // green
    currentGuestName: "Jeff - Online",
    seatedAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    activeSessionId: "session-t1",
    notes: "Reservation 19:00"
  },
  {
    id: "T2",
    tableNumber: 2,
    name: "Table 2",
    section: "Main Floor",
    shape: "square",
    seats: 4,
    x: 600,
    y: 80,
    status: "occupied", // green
    currentGuestName: "Sharma Family",
    seatedAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    activeSessionId: "session-t2",
    notes: ""
  },
  {
    id: "T3",
    tableNumber: 3,
    name: "Table 3",
    section: "Main Floor",
    shape: "rectangle",
    seats: 6,
    x: 820,
    y: 80,
    status: "available", // beige / free
    currentGuestName: null,
    seatedAt: null,
    activeSessionId: null,
    notes: ""
  },

  // Row 2
  {
    id: "T4",
    tableNumber: 4,
    name: "Table 4",
    section: "Main Floor",
    shape: "square",
    seats: 4,
    x: 420,
    y: 250,
    status: "occupied", // green
    currentGuestName: "Amit K.",
    seatedAt: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
    activeSessionId: "session-t4",
    notes: ""
  },
  {
    id: "T5",
    tableNumber: 5,
    name: "Table 5",
    section: "Main Floor",
    shape: "square",
    seats: 4,
    x: 600,
    y: 250,
    status: "available", // beige
    currentGuestName: null,
    seatedAt: null,
    activeSessionId: null,
    notes: ""
  },
  {
    id: "T6",
    tableNumber: 6,
    name: "Table 6",
    section: "Main Floor",
    shape: "rectangle",
    seats: 6,
    x: 820,
    y: 290,
    status: "ready", // green with red badge 1 (ready for takeaway)
    currentGuestName: "Vikram & Friends",
    seatedAt: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
    activeSessionId: "session-t6",
    notes: "Food ready for takeaway!"
  },

  // Row 3
  {
    id: "T7",
    tableNumber: 7,
    name: "Table 7",
    section: "Main Floor",
    shape: "square",
    seats: 4,
    x: 420,
    y: 430,
    status: "bill_requested", // coral/red border: bill requested
    currentGuestName: "Pooja Deshmukh",
    seatedAt: new Date(Date.now() - 65 * 60 * 1000).toISOString(),
    activeSessionId: "session-t7",
    notes: "Requested bill"
  },
  {
    id: "T8",
    tableNumber: 8,
    name: "Table 8",
    section: "Main Floor",
    shape: "square",
    seats: 4,
    x: 600,
    y: 430,
    status: "bill_requested", // coral/red border
    currentGuestName: "Rohan Patil",
    seatedAt: new Date(Date.now() - 50 * 60 * 1000).toISOString(),
    activeSessionId: "session-t8",
    notes: "Requested bill"
  },

  // Row 4
  {
    id: "T9",
    tableNumber: 9,
    name: "Table 9",
    section: "Main Floor",
    shape: "rectangle",
    seats: 6,
    x: 180,
    y: 600,
    status: "bill_requested", // coral/red border
    currentGuestName: "Dr. Kulkarni Group",
    seatedAt: new Date(Date.now() - 75 * 60 * 1000).toISOString(),
    activeSessionId: "session-t9",
    notes: "Bill pending"
  },
  {
    id: "T10",
    tableNumber: 10,
    name: "Table 10",
    section: "Main Floor",
    shape: "square",
    seats: 4,
    x: 420,
    y: 600,
    status: "bill_requested", // coral/red border
    currentGuestName: "Nilesh M.",
    seatedAt: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
    activeSessionId: "session-t10",
    notes: ""
  },
  {
    id: "T11",
    tableNumber: 11,
    name: "Table 11",
    section: "Main Floor",
    shape: "square",
    seats: 4,
    x: 600,
    y: 600,
    status: "preparing", // purple outline (kitchen preparing)
    currentGuestName: "Gaurav S.",
    seatedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    activeSessionId: "session-t11",
    notes: "Soup & Starters cooking"
  },
  {
    id: "T12",
    tableNumber: 12,
    name: "Table 12",
    section: "Main Floor",
    shape: "rectangle",
    seats: 6,
    x: 820,
    y: 600,
    status: "preparing", // purple outline
    currentGuestName: "Corporate Meet (6)",
    seatedAt: new Date(Date.now() - 18 * 60 * 1000).toISOString(),
    activeSessionId: "session-t12",
    notes: "Paneer Butter Masala preparing"
  }
];

// Initial demo sessions using the new Vispute Food Court menu
const initialSessions = [
  {
    id: "session-t1",
    tableId: "T1",
    tableNumber: 1,
    guestName: "Jeff - Online",
    status: "active",
    startedAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    rounds: [
      {
        roundNumber: 1,
        orderedAt: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
        orderType: "QR Customer",
        items: [
          { id: "item-1", menuItemId: "vfc-m-7", name: "Paneer Momos / पनीर मोमोज", price: 130, quantity: 2, isVeg: true, status: "served", notes: "Extra spicy chutney" },
          { id: "item-2", menuItemId: "vfc-m-18", name: "Chaas / चास", price: 20, quantity: 2, isVeg: true, status: "served", notes: "" }
        ]
      },
      {
        roundNumber: 2,
        orderedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        orderType: "QR Customer",
        items: [
          { id: "item-3", menuItemId: "vfc-m-88", name: "Paneer Butter Masala / पनीर बटर मसाला", price: 190, quantity: 1, isVeg: true, status: "served", notes: "" },
          { id: "item-4", menuItemId: "vfc-m-119", name: "Butter Naan / बटर नान", price: 40, quantity: 3, isVeg: true, status: "served", notes: "" }
        ]
      }
    ]
  },
  {
    id: "session-t6",
    tableId: "T6",
    tableNumber: 6,
    guestName: "Vikram & Friends",
    status: "active",
    startedAt: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
    rounds: [
      {
        roundNumber: 1,
        orderedAt: new Date(Date.now() - 18 * 60 * 1000).toISOString(),
        orderType: "QR Customer",
        items: [
          { id: "item-61", menuItemId: "vfc-m-25", name: "Paneer Malai Tikka / पनीर मलाई टिक्का", price: 380, quantity: 1, isVeg: true, status: "prepared", notes: "Soft & fresh" },
          { id: "item-62", menuItemId: "vfc-m-18", name: "Chaas / चास", price: 20, quantity: 4, isVeg: true, status: "prepared", notes: "Chilled" }
        ]
      }
    ]
  },
  {
    id: "session-t7",
    tableId: "T7",
    tableNumber: 7,
    guestName: "Pooja Deshmukh",
    status: "bill_requested",
    startedAt: new Date(Date.now() - 65 * 60 * 1000).toISOString(),
    rounds: [
      {
        roundNumber: 1,
        orderedAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
        orderType: "Waiter Manual",
        items: [
          { id: "item-71", menuItemId: "vfc-m-87", name: "Paneer Masala / पनीर मसाला", price: 180, quantity: 1, isVeg: true, status: "served", notes: "" },
          { id: "item-72", menuItemId: "vfc-m-116", name: "Butter Roti / बटर रोटी", price: 20, quantity: 4, isVeg: true, status: "served", notes: "" },
          { id: "item-73", menuItemId: "vfc-m-1", name: "Udid Roast / उडीद भाजणे", price: 20, quantity: 2, isVeg: true, status: "served", notes: "" },
          { id: "item-74", menuItemId: "vfc-m-127", name: "Jeera Rice - Half / जिरा तांदूळ - अर्धा", price: 80, quantity: 1, isVeg: true, status: "served", notes: "" }
        ]
      }
    ]
  },
  {
    id: "session-t11",
    tableId: "T11",
    tableNumber: 11,
    guestName: "Gaurav S.",
    status: "active",
    startedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    rounds: [
      {
        roundNumber: 1,
        orderedAt: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
        orderType: "QR Customer",
        items: [
          { id: "item-111", menuItemId: "vfc-m-10", name: "Manchow Soup / मांचो सूप", price: 100, quantity: 2, isVeg: true, status: "preparing", notes: "Extra crispy noodles" },
          { id: "item-112", menuItemId: "vfc-m-39", name: "Veg Manchurian / व्हेज मंचुरियन", price: 120, quantity: 1, isVeg: true, status: "preparing", notes: "Dry & spicy" }
        ]
      }
    ]
  }
];

module.exports = {
  initialMenu,
  initialTables,
  initialSessions
};
