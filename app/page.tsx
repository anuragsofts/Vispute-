import Link from 'next/link'
import Image from 'next/image'
import { getDb } from '@/lib/mongodb/client'
import { formatPrice } from '@/lib/utils'

export default async function HomePage() {
  let tables: any[] = []
  let featuredDishes: any[] = []
  let categoriesCount = 14
  let totalDishesCount = 174

  try {
    const db = await getDb()
    tables = await db
      .collection('tables')
      .find({ is_active: true })
      .sort({ number: 1 })
      .toArray()

    featuredDishes = await db
      .collection('menu_items')
      .find({
        name_en: {
          $in: [
            'Paneer Matka Biryani',
            'Tandoor Starter Platter',
            'Special Shev Bhaji',
            'Kaju Angara',
            'Paneer Tikka Masala',
            'Cheese Garlic Naan',
          ],
        },
      })
      .limit(6)
      .toArray()

    categoriesCount = await db.collection('categories').countDocuments()
    totalDishesCount = await db.collection('menu_items').countDocuments()
  } catch (e) {
    console.warn('DB fetch warning on home page:', e)
  }

  return (
    <div className="min-h-screen bg-cream text-brown-900 selection:bg-saffron selection:text-white font-mukta">
      {/* 1. Top Announcement Bar */}
      <div className="bg-saffron text-white py-1.5 px-4 text-center text-xs font-devanagari font-bold flex items-center justify-center gap-2">
        <span className="w-2 h-2 rounded-full bg-amber-200 animate-pulse" />
        <span>शुद्ध शाकाहारी व स्पेशल फॅमिली रेस्टॉरंट · मोफत हाय-स्पीड वायफाय आणि टेबल QR ऑर्डरिंग चालू आहे!</span>
      </div>

      {/* 2. Navigation Header */}
      <header className="sticky top-0 z-40 bg-cream/95 backdrop-blur-md border-b border-divider px-4 lg:px-8 py-3.5 shadow-xs">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-saffron text-white rounded-xl flex items-center justify-center text-2xl shadow-sm border border-amber-300">
              🍲
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-veg" title="100% Pure Veg" />
                <h1 className="font-devanagari text-2xl font-black text-saffron tracking-tight">
                  हॉटेल विस्पुते
                </h1>
              </div>
              <p className="text-[11px] text-brown-600 font-devanagari font-semibold">
                शुद्ध व्हेज फॅमिली रेस्टॉरंट · Hotel Vispute
              </p>
            </div>
          </div>

          {/* Quick Staff Navigation Links */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/kitchen"
              className="btn-press hidden sm:flex items-center gap-1.5 text-xs font-devanagari font-bold bg-[#111827] text-amber-400 px-3 py-2 rounded-xl shadow-xs"
            >
              <span>🍳</span>
              <span>किचन (KDS)</span>
            </Link>
            <Link
              href="/waiter"
              className="btn-press hidden sm:flex items-center gap-1.5 text-xs font-devanagari font-bold bg-amber-100 border border-amber-300 text-amber-900 px-3 py-2 rounded-xl shadow-xs"
            >
              <span>🛎️</span>
              <span>वेटर</span>
            </Link>
            <Link
              href="/billing"
              className="btn-press hidden sm:flex items-center gap-1.5 text-xs font-devanagari font-bold bg-cream border border-divider text-brown-900 px-3 py-2 rounded-xl shadow-xs"
            >
              <span>💰</span>
              <span>बिलिंग</span>
            </Link>
            <Link
              href="/admin"
              className="btn-press flex items-center gap-1.5 text-xs font-devanagari font-bold bg-chilli text-white px-3.5 py-2 rounded-xl shadow-sm"
            >
              <span>⚙️</span>
              <span>अ‍ॅडमिन लॉगिन</span>
            </Link>
          </div>
        </div>
      </header>

      {/* 3. Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-parchment to-cream py-12 px-4 lg:px-8 border-b border-divider">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-4 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-amber-100 border border-amber-300 text-amber-900 px-3.5 py-1.5 rounded-full text-xs font-devanagari font-bold">
              <span>🌾</span>
              <span>अस्सल महाराष्ट्रीयन, तंदूर व चायनीज चव</span>
            </div>

            <h2 className="font-devanagari text-3xl sm:text-5xl font-black text-brown-900 leading-tight">
              गरमागरम जेवणाची चव, <br />
              <span className="text-saffron">थेट तुमच्या टेबलवर QR स्कॅनने!</span>
            </h2>

            <p className="font-devanagari text-brown-700 text-sm sm:text-base max-w-xl mx-auto lg:mx-0 leading-relaxed">
              हॉटेल विस्पुतेमध्ये आपले सहर्ष स्वागत! आता कोणत्याही रांगेत उभे न राहता, तुमच्या टेबलवरील QR कोड स्कॅन करा, आवडीचे पदार्थ निवडा आणि ऑर्डर थेट किचनमध्ये पाठवा.
            </p>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2">
              <a
                href="#tables-section"
                className="btn-press bg-chilli hover:bg-chilli-dark text-white font-devanagari font-black text-base px-6 py-3.5 rounded-2xl shadow-md flex items-center gap-2"
              >
                <span>📱 थेट टेबल मेनू उघडा</span>
                <span>›</span>
              </a>
              <a
                href="tel:9822097650"
                className="btn-press bg-cream hover:bg-parchment border border-divider text-brown-900 font-devanagari font-bold text-sm px-5 py-3.5 rounded-2xl flex items-center gap-2"
              >
                <span>📞 संपर्क: 9822097650</span>
              </a>
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-3 gap-3 pt-6 border-t border-divider max-w-md mx-auto lg:mx-0">
              <div>
                <span className="font-mukta font-black text-2xl text-saffron block">100%</span>
                <span className="text-xs text-brown-600 font-devanagari">शुद्ध शाकाहारी</span>
              </div>
              <div>
                <span className="font-mukta font-black text-2xl text-brown-900 block">{totalDishesCount}+</span>
                <span className="text-xs text-brown-600 font-devanagari">विविध पदार्थ</span>
              </div>
              <div>
                <span className="font-mukta font-black text-2xl text-emerald-700 block">3 मि.</span>
                <span className="text-xs text-brown-600 font-devanagari">जलद KDS सेवा</span>
              </div>
            </div>
          </div>

          {/* Hero Image Showcase */}
          <div className="lg:col-span-5 relative">
            <div className="relative w-full aspect-4/3 rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
              <Image
                src="https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=800&auto=format&fit=crop&q=80"
                alt="Hotel Vispute Specialties"
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent flex flex-col justify-end p-5 text-white">
                <span className="bg-veg text-white text-[10px] font-bold px-2 py-0.5 rounded w-fit uppercase font-mono mb-1">
                  Pure Veg Special
                </span>
                <h3 className="font-devanagari font-black text-xl">
                  पनीर मटका व स्पेशल तंदूर थाळी
                </h3>
                <p className="text-xs text-amber-200 font-mukta">
                  अस्सल कोल्हापुरी व काळा मसाला स्पेशल ग्रेव्ही
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Table QR Demo Links (Interactive Table Selector) */}
      <section id="tables-section" className="py-12 px-4 lg:px-8 max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <span className="text-xs font-devanagari font-bold bg-amber-100 text-amber-900 border border-amber-300 px-3 py-1 rounded-full uppercase">
            ग्राहक अनुभव (Customer QR Ordering)
          </span>
          <h2 className="font-devanagari text-2xl sm:text-3xl font-black text-brown-900 mt-2">
            कोणत्या टेबलवर बसला आहात? टेबल निवडा:
          </h2>
          <p className="text-xs text-brown-600 font-devanagari mt-1 max-w-lg mx-auto">
            खालील कोणत्याही टेबलवर क्लिक करा आणि थेट त्या टेबलचा मोबाइल QR मेनू उघडून ऑर्डर देऊन पहा:
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 max-w-4xl mx-auto">
          {tables.map(tbl => (
            <Link
              key={tbl.number}
              href={`/t/${tbl.secret_token}`}
              className="btn-press card-paper p-4 text-center rounded-2xl hover:border-saffron hover:bg-saffron hover:text-white group transition-all shadow-xs"
            >
              <div className="w-10 h-10 rounded-full bg-cream group-hover:bg-white text-saffron flex items-center justify-center text-lg mx-auto mb-2 border border-divider shadow-xs">
                🪑
              </div>
              <span className="font-devanagari text-xs text-brown-600 group-hover:text-amber-100 block">
                डायनिंग टेबल
              </span>
              <span className="font-mukta font-black text-2xl text-brown-900 group-hover:text-white block">
                टेबल {tbl.number}
              </span>
              <span className="text-[10px] text-saffron group-hover:text-white font-bold mt-1 inline-block">
                मेनू उघडा ›
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* 5. Chef's Specials Menu Showcase */}
      {featuredDishes.length > 0 && (
        <section className="bg-parchment/60 py-12 px-4 lg:px-8 border-y border-divider">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-2">
              <div>
                <span className="text-xs font-devanagari font-bold text-saffron uppercase tracking-wider">
                  शेफचे खास पदार्थ · Chef&apos;s Specials
                </span>
                <h2 className="font-devanagari text-2xl sm:text-3xl font-black text-brown-900 mt-1">
                  हॉटेल विस्पुतेचे प्रसिद्ध पदार्थ
                </h2>
              </div>
              <p className="text-xs text-brown-600 font-devanagari">
                {categoriesCount} श्रेणींमध्ये {totalDishesCount} हून अधिक पदार्थ उपलब्ध
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {featuredDishes.map(dish => (
                <div key={dish._id.toString()} className="card-paper overflow-hidden flex flex-col justify-between shadow-xs hover:border-saffron transition-all">
                  <div className="relative w-full h-44 bg-cream">
                    <Image
                      src={dish.image_url}
                      alt={dish.name_mr}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                    <div className="absolute top-2 left-2 bg-white/95 rounded-sm p-0.5 shadow-xs border border-green-700">
                      <div className="w-2.5 h-2.5 rounded-full bg-veg" />
                    </div>
                    <span className="absolute bottom-2 right-2 bg-black/75 text-amber-300 font-mukta font-bold text-sm px-2.5 py-1 rounded-lg">
                      {formatPrice(dish.price)}
                    </span>
                  </div>

                  <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-devanagari font-bold text-base text-brown-900">
                        {dish.name_mr}
                      </h3>
                      <p className="text-xs text-brown-500 font-mukta">{dish.name_en}</p>
                      {dish.description_mr && (
                        <p className="text-xs text-brown-700 font-devanagari mt-1 line-clamp-2">
                          {dish.description_mr}
                        </p>
                      )}
                    </div>

                    <Link
                      href="/t/tok_tbl01_vispute_a1b2c3d4"
                      className="btn-press w-full py-2 bg-saffron hover:bg-saffron-dark text-white rounded-xl text-center text-xs font-devanagari font-bold mt-2"
                    >
                      ऑर्डर करा (टेबलवर मागवा)
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 6. Staff & Operations Quick Portals */}
      <section className="py-12 px-4 lg:px-8 max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <span className="text-xs font-devanagari font-bold bg-cream border border-divider px-3 py-1 rounded-full text-brown-700">
            कर्मचारी व व्यवस्थापन (Staff & POS Portal)
          </span>
          <h2 className="font-devanagari text-2xl sm:text-3xl font-black text-brown-900 mt-2">
            रेस्टॉरंट सिस्टीम कार्यप्रणाली (Roles)
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/kitchen"
            className="btn-press card-paper p-5 flex flex-col justify-between hover:border-amber-500 transition-all shadow-xs"
          >
            <div>
              <span className="text-3xl block mb-2">🍳</span>
              <h3 className="font-devanagari font-black text-lg text-brown-900">
                किचन स्क्रीन (KDS)
              </h3>
              <p className="text-xs text-brown-600 font-devanagari mt-1">
                थेट ऑर्डर तिकीट, टाइमर, ऑडिओ रिंग्स (१ रिंग नवीन ऑर्डर, ३ रिंग्स जास्तीचे पदार्थ) व वेक लॉक स्क्रीन.
              </p>
            </div>
            <span className="text-xs font-bold font-devanagari text-amber-700 mt-4 block">
              किचन डिस्प्ले उघडा ›
            </span>
          </Link>

          <Link
            href="/waiter"
            className="btn-press card-paper p-5 flex flex-col justify-between hover:border-amber-500 transition-all shadow-xs"
          >
            <div>
              <span className="text-3xl block mb-2">🛎️</span>
              <h3 className="font-devanagari font-black text-lg text-brown-900">
                वेटर पॅनेल (Waiter)
              </h3>
              <p className="text-xs text-brown-600 font-devanagari mt-1">
                टेबल निवड, वेटर कॉल अलर्ट्स (ग्राहकाने वेटरला बोलावले), तयार अन्न सर्व्ह करणे व त्वरित ऑर्डर घेणे.
              </p>
            </div>
            <span className="text-xs font-bold font-devanagari text-amber-700 mt-4 block">
              वेटर सर्व्हिस उघडा ›
            </span>
          </Link>

          <Link
            href="/billing"
            className="btn-press card-paper p-5 flex flex-col justify-between hover:border-amber-500 transition-all shadow-xs"
          >
            <div>
              <span className="text-3xl block mb-2">💰</span>
              <h3 className="font-devanagari font-black text-lg text-brown-900">
                कॅशियर (Billing POS)
              </h3>
              <p className="text-xs text-brown-600 font-devanagari mt-1">
                चालू टेबल्सचे एकत्रित बिल, ५% जीएसटी, १०-अंकी मोबाईल नंबर संकलन, व्हॉट्सअ‍ॅप संमती व ८० मिमी थर्मल प्रिंट.
              </p>
            </div>
            <span className="text-xs font-bold font-devanagari text-amber-700 mt-4 block">
              बिलिंग काऊंटर उघडा ›
            </span>
          </Link>

          <Link
            href="/admin"
            className="btn-press card-paper p-5 flex flex-col justify-between hover:border-amber-500 transition-all shadow-xs"
          >
            <div>
              <span className="text-3xl block mb-2">⚙️</span>
              <h3 className="font-devanagari font-black text-lg text-brown-900">
                अ‍ॅडमिन (Owner)
              </h3>
              <p className="text-xs text-brown-600 font-devanagari mt-1">
                थेट विक्री विश्लेषण, मेनू दर बदल, सोल्ड आउट टॉगल, AI मेनू आयात, १० टेबल QR जनरेटर व ग्राहक CSV.
              </p>
            </div>
            <span className="text-xs font-bold font-devanagari text-amber-700 mt-4 block">
              अ‍ॅडमिन डॅशबोर्ड उघडा ›
            </span>
          </Link>
        </div>
      </section>

      {/* 7. Footer */}
      <footer className="bg-brown-900 text-cream py-10 px-4 lg:px-8 mt-12 border-t-4 border-saffron">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-3 h-3 rounded-full bg-veg" />
              <h4 className="font-devanagari text-2xl font-black text-amber-400">
                हॉटेल विस्पुते
              </h4>
            </div>
            <p className="text-xs text-brown-200 font-devanagari leading-relaxed">
              शुद्ध शाकाहारी व स्पेशल भोजनालय. अस्सल महाराष्ट्रीयन चव, ताज्या भाज्या आणि उत्तम कौटुंबिक वातावरण.
            </p>
            <p className="text-[11px] text-amber-300 font-mukta mt-2">
              फोन: +91 9822097650 / +91 9819076866
            </p>
          </div>

          <div>
            <h5 className="font-devanagari font-bold text-sm text-white mb-3">
              वेळ व माहिती (Timings)
            </h5>
            <ul className="text-xs text-brown-200 font-devanagari space-y-1.5">
              <li>सोमवार ते रविवार: सकाळी ११:०० ते रात्री ११:३०</li>
              <li>दुपारचे जेवण व थाळी: १२:०० ते ३:३०</li>
              <li>संध्याकाळचे स्नॅक्स व डिनर: ६:३० ते ११:३०</li>
              <li>शुद्ध व्हेज फॅमिली हॉल व पार्सल सुविधा उपलब्ध</li>
            </ul>
          </div>

          <div>
            <h5 className="font-devanagari font-bold text-sm text-white mb-3">
              द्रुत दुवे (Quick Links)
            </h5>
            <div className="flex flex-col gap-1.5 text-xs text-brown-200 font-devanagari">
              <Link href="/t/tok_tbl01_vispute_a1b2c3d4" className="hover:text-amber-400">
                📱 टेबल १ चा QR मेनू
              </Link>
              <Link href="/kitchen" className="hover:text-amber-400">
                🍳 किचन डिस्प्ले
              </Link>
              <Link href="/billing" className="hover:text-amber-400">
                💰 बिलिंग काऊंटर
              </Link>
              <Link href="/login" className="hover:text-amber-400">
                🔒 कर्मचारी ४-अंकी PIN लॉगिन
              </Link>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto pt-8 mt-8 border-t border-gray-800 text-center text-[11px] text-brown-400 font-devanagari">
          © {new Date().getFullYear()} हॉटेल विस्पुते (Hotel Vispute). All Rights Reserved. Built with Next.js, Tailwind CSS & MongoDB Atlas.
        </div>
      </footer>
    </div>
  )
}
