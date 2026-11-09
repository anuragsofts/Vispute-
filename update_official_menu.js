const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config();

const rawText = `Papad:
Udid Roast / उडीद भाजणे, 20
Udid Fry / उडीद तळणे, 20
Udid Masala / उडीद मसाला, 30
Nagali Roast / नागली भाजणे, 20
Nagali Fry / नागली फ्राय, 25
Nagali Masala / नागली मसाला, 40

Momos:
Paneer Momos / पनीर मोमोज, 130
Steam Momos / स्टीम मोमोज, 120

Soup:
Tomato Soup / टोमॅटो सूप, 120
Manchow Soup / मांचो सूप, 100
Manchurian Soup / मंचुरियन सूप, 110
Garlic Soup / लसूण सूप, 110
Hot and Sour Soup / गरम आणि आंबट सूप, 110
Mushroom Soup / मशरूम सूप, 150
Taiwan Soup / तैवान सूप, 180
Veg Clear Soup / व्हेज क्लिअर सूप, 100
Lemon Coriander Soup / लिंबू कोथिंबीर सूप, 120

Beverages:
Chaas / चास, 20

Indian Starter:
Finger Chips / फिंगर चिप्स, 90
Paneer Pakoda / पनीर पकोडा, 180
Kanda Bhaji / कांदा भजी, 100

Tandoor Starter:
Paneer Lahori / पनीर लाहोरी, 299
Paneer Afghani Roll / पनीर अफगाणी रोल, 550
Paneer Parda / पनीर पर्दा, 550
Paneer Malai Tikka / पनीर मलाई टिक्का, 380
Paneer Pahadi Tikka / पनीर पहाडी टिक्का, 350
Paneer Banjara Tikka / पनीर बंजारा टिक्का, 350
Paneer Achari Tikka / पनीर आचारी टिक्का, 350
Paneer Matka / पनीर मटका, 580
Veg Rosala Dum Potato / व्हेज रोसाला दम बटाटा, 350
Veg Seekh Kabab / व्हेज सीख कबाब, 299
Veg Cheese Roll / व्हेज चीज रोल, 399
Tandoor Starter Platter / तंदूर स्टार्टर थाळी, 999
Baby Corn Tikka / बेबी कॉर्न टिक्का, 350
Mushroom Tikka / मशरूम टिक्का, 350
Stuffed Mushroom / चोंदलेले मशरूम, 450
Cheese Rumali Khakra / चीज रुमाली खाकरा, 180

Chinese Starter:
Soyabean Chilli / सोयाबीन मिरची, 100
Veg Manchurian / व्हेज मंचुरियन, 120
Veg Manchurian Gravy / व्हेज मंचुरियन ग्रेव्ही, 140
Paneer Chilli / पनीर मिरची, 180
Mushroom Chilli / मशरूम मिरची, 180
Paneer Mexican / पनीर मेक्सिकन, 299
Paneer Sizzler / पनीर सिझलर, 499
Paneer Steak Sizzler / पनीर स्टीक सिझलर, 550
Paneer Forest / पनीरचे जंगल, 499
American Chopsuey / अमेरिकन चॉप्सुए, 350
Paneer Satay / पनीर साटे, 399
Paneer 65 / पनीर 65, 199
Paneer Crispy / पनीर कुरकुरीत, 199
Veg Spring Roll / व्हेज स्प्रिंग रोल, 150
Veg Lollipop / व्हेज लॉलीपॉप, 199
Cheese Corn Tikka / चीज कॉर्न टिक्का, 299
Cheese Ball / चीज बॉल, 299
Veg Golden Coin / व्हेज गोल्डन कॉईन, 220
Veg Shehni Roll / व्हेज शेहनी रोल, 250

Noodles:
Chinese Bhel / चायनीज भेळ, 150
Hakka Noodles / हक्का नूडल्स, 130
Schezwan Noodles / शेझवान नूडल्स, 150
Triple Noodles / ट्रिपल नूडल्स, 250
Singapore Noodles / सिंगापूर नूडल्स, 180
Manchurian Noodles / मंचुरियन नूडल्स, 180
Paneer Noodles / पनीर नूडल्स, 220
Mushroom Noodles / मशरूम नूडल्स, 200

Chinese Rice:
Fried Rice / तळलेले तांदूळ, 140
Paneer Fried Rice / पनीर फ्राईड राइस, 220
Schezwan Rice / शेझवान तांदूळ, 160
Singapore Rice / सिंगापूर तांदूळ, 180
Manchurian Rice / मंचुरियन भात, 180
Triple Rice / तिप्पट तांदूळ, 250
Mushroom Rice / मशरूम तांदूळ, 200

Veg Bahar:
Shev Bhaji / शेवभाजी, 100
Shev Tadka / शेव तडका, 120
Shev Tomato / शेव टोमॅटो, 120
Special Shev Bhaji / स्पेशल शेवभाजी, 150
Dal Fry / डाळ फ्राय, 110
Dal Tadka / दाल तडका, 120
Soyabean Masala / सोयाबीन मसाला, 110
Baingan Masala / बैंगन मसाला, 120
Bhaji Amti / भजी आमटी, 110
Chana Masala / चना मसाला, 120
Shevga Masala / शेवगा मसाला, 120
Besan Pithla / बेसन पिठला, 110
Bhindi Masala / भिंडी मसाला, 120
Methi Pithla / मेथी पिठला, 120
Methi Masala / मेथी मसाला, 120
Aloo Matar / आलू मातर, 150
Lasoon Methi / लसून मेथी, 150
Aloo Jeera / आलू जीरा, 120
Malai Methi / मलाई मेथी, 150
Lasoon Palak / लासून पालक, 150
Green Palak / हिरवी पालक, 120
Tomato Chutney / टोमॅटो चटणी, 110
Mirchi Thecha / मिर्ची थेचा, 80
Papad Churi / पापड चुरी, 110

Special Veg:
Kaju Masala / काजू मसाला, 200
Kaju Curry Sweet / काजू करी गोड, 250
Kaju Angara / काजू अंगारा, 250
Kaju Mushroom Masala / काजू मशरूम मसाला, 220
Mushroom Masala / मशरूम मसाला, 180
Veg Angara / व्हेज अंगारा, 240
Veg Khazana / व्हेज खजाना, 180
Veg Hyderabadi / हैदराबादी व्हेज, 170
Veg Lahori / लाहोरी व्हेज, 160
Veg Kolhapuri / व्हेज कोल्हापुरी, 120
Cheese Mushroom Masala / चीज मशरूम मसाला, 250
Mix Veg / मिक्स व्हेज, 110
Malai Kofta / मलाई कोफ्ता, 250
Veg Kadai / व्हेज कढई, 180
Veg Kofta / व्हेज कोफ्ता, 220
Veg Patiala / व्हेज पटियाला, 200
Veg Jaipuri / व्हेज जयपुरी, 180
Veg Bhuna / व्हेज भुना, 180
Veg Maharaja / व्हेज महाराजा, 200
Veg Pahadi / व्हेज पहाडी, 200
Veg Maratha / व्हेज मराठा, 180
Navratan Korma / नवरतन कोरमा, 220
Veg Jalfrezi / व्हेज जालफ्रेझी, 200

Paneer Special:
Paneer Masala / पनीर मसाला, 180
Paneer Butter Masala / पनीर बटर मसाला, 190
Palak Paneer / पालक पनीर, 180
Cheese Butter Masala / चीज बटर मसाला, 220
Paneer Kesari / पनीर केसरी, 280
Paneer Fusion Tadka / पनीर फ्युजन तडका, 520
Malai Paneer / मलाई पनीर, 250
Paneer Handi - 3 Plates / पनीर हंडी - 3 प्लेट्स, 570
Paneer Angara / पनीर अंगारा, 250
Paneer Mumtaz / पनीर मुमताज, 400
Paneer Toofani / पनीर तुफानी, 270
Paneer Pasanda / पनीर पासंडा, 280
Moti Matar Paneer / मोती मटर पनीर, 300
Paneer Afghani Handi - 3 Plates / पनीर अफगाणी हंडी - 3 प्लेट्स, 570
Paneer Tikka Masala / पनीर टिक्का मसाला, 220
Vispute Special Red White Green Gravy / विसपुते स्पेशल लाल पांढरी हिरवी ग्रेव्ही, 600
Paneer Maratha / पनीर मराठा, 230
Paneer Lababdar / पनीर लबाबदार, 250
Paneer Koliwada / पनीर कोळीवाडा, 250
Paneer Kaleji / पनीर कालेजी, 280
Kaju Paneer Masala / काजू पनीर मसाला, 220
Paneer Malai Kofta / पनीर मलाई कोफ्ता, 280
Kadai Paneer / कढई पनीर, 200
Shahi Paneer / शाही पनीर, 200
Paneer Bhurji / पनीर भुर्जी, 200
Chole Paneer / छोले पनीर, 220
Veg Diwani Handi - 3 Plates / व्हेज दिवाणी हंडी - 3 प्लेट्स, 600

Roti:
Tawa Roti / तवा रोटी, 15
Tandoor Roti / तंदूर रोटी, 12
Butter Roti / बटर रोटी, 20
Bhakri / भाकरी, 20
Butter Bhakri / लोणी भाकरी, 25
Butter Naan / बटर नान, 40
Garlic Naan / लसूण नान, 50
Cheese Garlic Naan / चीज लसूण नान, 60
Butter Kulcha / लोणी कुलचा, 50
Lachha Paratha / लच्छा पराठा, 50

Biryani and Rice:
Biryani Special Cream Rice - Half / बिर्याणी स्पेशल क्रीम राइस - अर्धा, 70
Biryani Special Cream Rice - Full / बिर्याणी स्पेशल क्रीम राइस - फुल, 120
Veg Biryani / व्हेज बिर्याणी, 250
Jeera Rice - Half / जिरा तांदूळ - अर्धा, 80
Jeera Rice - Full / जिरा तांदूळ - पूर्ण, 130
Dum Biryani / दम बिर्याणी, 280
Biryani Rice / बिर्याणी भात, 140
Hyderabadi Biryani / हैदराबादी बिर्याणी, 250
Lemon Rice / लिंबू भात, 140
Paneer Tikka Biryani / पनीर टिक्का बिर्याणी, 300
Butter Dal Khichdi / बटर डाळ खिचडी, 150
Kaju Paneer Biryani / काजू पनीर बिर्याणी, 350
Masala Rice / मसाला भात, 160
Malai Paneer Biryani / मलाई पनीर बिर्याणी, 350
Veg Pulao / व्हेज पुलाव, 180
Paneer Matka Biryani / पनीर मटका बिर्याणी, 450
Kashmiri Pulao / काश्मिरी पुलाव, 200
Paneer Pulao / पनीर पुलाव, 220
Tawa Pulao / तवा पुलाव, 200`;

const CATEGORY_MR_MAP = {
  "Papad": "पापड",
  "Momos": "मोमोज",
  "Soup": "सूप",
  "Beverages": "शीतपेये / चास",
  "Indian Starter": "इंडियन स्टार्टर्स",
  "Tandoor Starter": "तंदूर स्टार्टर्स",
  "Chinese Starter": "चायनीज स्टार्टर्स",
  "Noodles": "नूडल्स",
  "Chinese Rice": "चायनीज राईस",
  "Veg Bahar": "व्हेज बहार",
  "Special Veg": "स्पेशल व्हेज",
  "Paneer Special": "पनीर स्पेशल",
  "Roti": "रोटी / नान",
  "Biryani and Rice": "बिर्याणी आणि राईस"
};

const IMAGES = {
  papadMasala: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500&auto=format&fit=crop&q=60",
  papadRoast: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500&auto=format&fit=crop&q=60",
  momos: "https://images.unsplash.com/photo-1625220194771-7ebdea0b70b9?w=500&auto=format&fit=crop&q=60",
  soupTomato: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=500&auto=format&fit=crop&q=60",
  soupDark: "https://images.unsplash.com/photo-1603105037880-880cd4edfb0d?w=500&auto=format&fit=crop&q=60",
  chaas: "https://images.unsplash.com/photo-1556881286-fc6915169721?w=500&auto=format&fit=crop&q=60",
  frenchFries: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=500&auto=format&fit=crop&q=60",
  pakoda: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500&auto=format&fit=crop&q=60",
  paneerTikka: "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=500&auto=format&fit=crop&q=60",
  tandoorPlatter: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=500&auto=format&fit=crop&q=60",
  seekhKabab: "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=500&auto=format&fit=crop&q=60",
  manchurian: "https://images.unsplash.com/photo-1525755662778-989d0524087e?w=500&auto=format&fit=crop&q=60",
  springRoll: "https://images.unsplash.com/photo-1544025162-d76694265947?w=500&auto=format&fit=crop&q=60",
  sizzler: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500&auto=format&fit=crop&q=60",
  crispyStarter: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=500&auto=format&fit=crop&q=60",
  noodles: "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=500&auto=format&fit=crop&q=60",
  friedRice: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=500&auto=format&fit=crop&q=60",
  dalTadka: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&auto=format&fit=crop&q=60",
  paneerButter: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=500&auto=format&fit=crop&q=60",
  richCurry: "https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=500&auto=format&fit=crop&q=60",
  naanRoti: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=500&auto=format&fit=crop&q=60",
  biryani: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&auto=format&fit=crop&q=60",
  matkaBiryani: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=500&auto=format&fit=crop&q=60"
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
    if (name.includes('kofta')) return IMAGES.paneerButter;
    return IMAGES.richCurry;
  }
  if (cat === 'Paneer Special') return IMAGES.paneerButter;
  if (cat === 'Roti') return IMAGES.naanRoti;
  if (cat === 'Biryani and Rice') {
    if (name.includes('matka')) return IMAGES.matkaBiryani;
    if (name.includes('khichdi') || name.includes('jeera')) return IMAGES.dalTadka;
    return IMAGES.biryani;
  }
  return IMAGES.paneerButter;
}

const lines = rawText.split('\n');
let currentCategory = '';
let currentCategoryMr = '';
const parsedMenu = [];
let idCounter = 1;

for (let line of lines) {
  line = line.trim();
  if (!line) continue;
  if (line.endsWith(':')) {
    currentCategory = line.slice(0, -1).trim();
    currentCategoryMr = CATEGORY_MR_MAP[currentCategory] || currentCategory;
    continue;
  }
  const lastCommaIndex = line.lastIndexOf(',');
  if (lastCommaIndex === -1) continue;

  const namesPart = line.slice(0, lastCommaIndex).trim();
  const priceStr = line.slice(lastCommaIndex + 1).trim();
  const price = parseInt(priceStr, 10);

  const parts = namesPart.split('/');
  const enName = parts[0] ? parts[0].trim() : namesPart;
  const mrName = parts[1] ? parts[1].trim() : enName;

  parsedMenu.push({
    id: `vfc-m-${idCounter++}`,
    name: enName,
    marathiName: mrName,
    category: currentCategory,
    categoryMr: currentCategoryMr,
    price: price,
    isVeg: true,
    rating: 4.8,
    description: `${mrName} (${enName}) - विस्पुतेची खास चवदार रेसिपी`,
    image: getImageForDish(currentCategory, enName),
    isAvailable: true,
    prepTime: '12 mins'
  });
}

console.log(`Parsed total ${parsedMenu.length} dishes across all categories.`);

// Load existing tables from store
const storePath = path.join(__dirname, 'server', 'data', 'vispute_store.json');
let existingStore = {};
if (fs.existsSync(storePath)) {
  existingStore = JSON.parse(fs.readFileSync(storePath, 'utf8'));
}

const updatedStore = {
  ...existingStore,
  menu: parsedMenu
};

fs.writeFileSync(storePath, JSON.stringify(updatedStore, null, 2), 'utf8');
console.log(`Updated ${storePath}`);

// Also update client/src/data/defaultData.js
const clientDefaultDataPath = path.join(__dirname, 'client', 'src', 'data', 'defaultData.js');
const clientDefaultDataContent = `export const DEFAULT_MENU = ${JSON.stringify(parsedMenu, null, 2)};\n\nexport const DEFAULT_TABLES = ${JSON.stringify(updatedStore.tables, null, 2)};\n`;
fs.writeFileSync(clientDefaultDataPath, clientDefaultDataContent, 'utf8');
console.log(`Updated ${clientDefaultDataPath}`);

// Update MongoDB Atlas if connected
async function syncToAtlas() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.log('No MONGODB_URI in .env');
    return;
  }
  try {
    console.log('Connecting to MongoDB Atlas to update menu...');
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
    console.log('Connected to Atlas!');
    
    // Check if Menu collection exists
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log('Collections in Atlas:', collections.map(c => c.name));

    // Save menu in a dedicated collection 'menu_items'
    const menuColl = db.collection('menu_items');
    await menuColl.deleteMany({});
    await menuColl.insertMany(parsedMenu);
    console.log(`Inserted ${parsedMenu.length} dishes into MongoDB Atlas 'menu_items' collection!`);

    await mongoose.disconnect();
    console.log('Atlas sync finished successfully.');
  } catch (err) {
    console.error('Atlas sync note:', err.message);
  }
}

syncToAtlas().then(() => {
  console.log('All update tasks completed!');
  process.exit(0);
});
