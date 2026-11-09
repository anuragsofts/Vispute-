import React, { useState, useMemo } from 'react';
import { useRestaurant } from '../context/RestaurantContext';
import { 
  Utensils, 
  Plus, 
  Search, 
  CheckCircle, 
  XCircle, 
  Upload, 
  Image as ImageIcon, 
  Camera, 
  Sparkles,
  X,
  Check
} from 'lucide-react';

// Preset authentic photos for quick 1-click selection
const PRESET_PHOTOS = [
  { label: 'पापड / Papad', url: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500&auto=format&fit=crop&q=60' },
  { label: 'मोमोज / Momos', url: 'https://images.unsplash.com/photo-1625220194771-7ebdea0b70b9?w=500&auto=format&fit=crop&q=60' },
  { label: 'सूप / Soup', url: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=500&auto=format&fit=crop&q=60' },
  { label: 'पनीर टिक्का / Paneer Tikka', url: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=500&auto=format&fit=crop&q=60' },
  { label: 'मंचुरियन / Manchurian', url: 'https://images.unsplash.com/photo-1525755662778-989d0524087e?w=500&auto=format&fit=crop&q=60' },
  { label: 'नूडल्स / Noodles', url: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=500&auto=format&fit=crop&q=60' },
  { label: 'फ्राईड राईस / Fried Rice', url: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=500&auto=format&fit=crop&q=60' },
  { label: 'दाल तडका / Dal Tadka', url: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&auto=format&fit=crop&q=60' },
  { label: 'पनीर बटर मसाला / Paneer', url: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=500&auto=format&fit=crop&q=60' },
  { label: 'रोटी / Roti', url: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=500&auto=format&fit=crop&q=60' },
  { label: 'दम बिर्याणी / Biryani', url: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&auto=format&fit=crop&q=60' },
  { label: 'चास / Chaas', url: 'https://images.unsplash.com/photo-1556881286-fc6915169721?w=500&auto=format&fit=crop&q=60' }
];

export const MenuManager = () => {
  const { menu, toggleMenuItem, addMenuItem, showNotification, lang } = useRestaurant();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPresets, setShowPresets] = useState(false);

  // Dynamic Categories from existing menu
  const categories = useMemo(() => {
    const set = new Set(menu.map(m => m.category));
    return ['All', ...Array.from(set)];
  }, [menu]);

  // New item form state
  const [newItem, setNewItem] = useState({
    name: '',
    marathiName: '',
    category: 'Special Veg',
    price: '',
    isVeg: true,
    description: '',
    prepTime: '12 mins',
    image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=500&auto=format&fit=crop&q=60'
  });

  const filteredMenu = menu.filter(item => {
    if (selectedCategory !== 'All' && item.category !== selectedCategory) return false;
    if (search) {
      const q = search.toLowerCase();
      const matchEn = item.name.toLowerCase().includes(q);
      const matchMr = item.marathiName && item.marathiName.toLowerCase().includes(q);
      const matchCat = item.category.toLowerCase().includes(q);
      if (!matchEn && !matchMr && !matchCat) return false;
    }
    return true;
  });

  // Handle local image file upload
  const handleImageFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showNotification('कृपया योग्य फोटो निवडा (Please select an image file)', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const dataUrl = uploadEvent.target?.result;
      if (dataUrl) {
        setNewItem(prev => ({ ...prev, image: dataUrl }));
        showNotification('फोटो यशस्वीरित्या लोड झाला! (Image uploaded)', 'success');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if ((!newItem.name && !newItem.marathiName) || !newItem.price) {
      showNotification('कृपया पदार्थाचे नाव आणि किंमत टाका (Enter dish name and price)', 'error');
      return;
    }

    try {
      const dishName = newItem.name || newItem.marathiName;
      const marathiName = newItem.marathiName || newItem.name;

      await addMenuItem({
        ...newItem,
        name: dishName,
        marathiName,
        price: Number(newItem.price),
        description: newItem.description || `${marathiName} (${dishName}) - ताजे व चविष्ट`
      });

      setShowAddModal(false);
      setNewItem({
        name: '',
        marathiName: '',
        category: 'Special Veg',
        price: '',
        isVeg: true,
        description: '',
        prepTime: '12 mins',
        image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=500&auto=format&fit=crop&q=60'
      });
      showNotification(`मेनूमध्ये नवीन पदार्थ "${marathiName}" जोडला गेला!`, 'success');
    } catch (err) {
      showNotification(err.message, 'error');
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#f8fafc] overflow-y-auto p-4 md:p-6">
      <div className="max-w-6xl mx-auto w-full space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                📋
              </span>
              <h1 className="text-xl font-black text-slate-800">
                {lang === 'mr' ? 'मेनू आणि पदार्थ व्यवस्थापन' : 'Menu & Dish Management'}
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {lang === 'mr' 
                ? 'नवीन पदार्थ फोटोसहित जोडा, भाव बदला किंवा उपलब्ध/संपले (In-stock/Out-of-stock) करा' 
                : 'Add new dishes with photos, update prices, or toggle availability'}
            </p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" /> 
            <span>{lang === 'mr' ? 'नवीन पदार्थ जोडा (+फोटो)' : 'Add New Dish (+Photo)'}</span>
          </button>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200">
          <div className="flex gap-2 overflow-x-auto pb-1 max-w-full">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all ${
                  selectedCategory === cat ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={lang === 'mr' ? 'पदार्थ शोधा...' : 'Filter dishes...'}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Dishes Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMenu.map(dish => (
            <div
              key={dish.id}
              className={`bg-white rounded-2xl border p-4 shadow-2xs flex flex-col justify-between transition-all ${
                dish.isAvailable ? 'border-slate-200' : 'border-rose-200 bg-rose-50/20 opacity-70'
              }`}
            >
              <div className="flex gap-3">
                <img
                  src={dish.image}
                  alt={dish.name}
                  className="w-20 h-20 rounded-xl object-cover border border-slate-100 shrink-0 shadow-xs"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2.5 h-2.5 rounded-full border ${dish.isVeg ? 'bg-emerald-500 border-emerald-700' : 'bg-rose-500 border-rose-700'}`} />
                    <h3 className="font-bold text-xs text-slate-900 truncate">{dish.name}</h3>
                  </div>
                  <span className="text-[10px] text-slate-400 block mt-0.5">{dish.category}</span>
                  <div className="text-sm font-black font-mono text-slate-900 mt-1">₹{dish.price}</div>
                  <span className="text-[10px] text-slate-500 font-mono">⏱️ {dish.prepTime}</span>
                </div>
              </div>

              <p className="text-[11px] text-slate-500 line-clamp-2 mt-2 leading-relaxed">
                {dish.description}
              </p>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                  dish.isAvailable ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                }`}>
                  {dish.isAvailable ? (lang === 'mr' ? 'उपलब्ध (In Stock)' : 'In Stock') : (lang === 'mr' ? 'संपले (Out of Stock)' : 'Out of Stock')}
                </span>

                <button
                  onClick={() => toggleMenuItem(dish.id)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    dish.isAvailable
                      ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                      : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                  }`}
                >
                  {dish.isAvailable ? (lang === 'mr' ? 'संपले म्हणून मार्क करा' : 'Mark Out of Stock') : (lang === 'mr' ? 'उपलब्ध करा' : 'Mark Available')}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Dish Modal with Photo Upload and Presets */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleCreate} className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-black text-base text-slate-800">
                {lang === 'mr' ? 'नवीन पदार्थ जोडा (फोटोसहित)' : 'Add New Dish to Menu'}
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* IMAGE PICTURE SECTION */}
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-3">
              <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-emerald-600" />
                  {lang === 'mr' ? 'पदार्थाचा फोटो (Dish Image Picture)' : 'Dish Image Picture'}
                </span>
                <span className="text-[10px] text-emerald-700 font-semibold">
                  {lang === 'mr' ? 'गॅलरीतून निवडा किंवा फोटो अपलोड करा' : 'Select or upload file'}
                </span>
              </label>

              {/* Image Preview & Upload Controls */}
              <div className="flex items-center gap-3">
                <div className="relative w-24 h-24 rounded-2xl overflow-hidden border-2 border-dashed border-emerald-500 bg-white shrink-0 shadow-2xs">
                  {newItem.image ? (
                    <img
                      src={newItem.image}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                      <Camera className="w-6 h-6 mb-1" />
                      <span className="text-[9px]">फोटो नाही</span>
                    </div>
                  )}
                </div>

                <div className="flex-1 space-y-2">
                  {/* File Upload Button */}
                  <label className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold cursor-pointer flex items-center justify-center gap-2 shadow-xs transition-all">
                    <Upload className="w-4 h-4" />
                    <span>{lang === 'mr' ? '📁 फोन/संगणकावरून फोटो निवडा' : 'Upload from Device'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileUpload}
                      className="hidden"
                    />
                  </label>

                  {/* Preset Photos Picker Toggle */}
                  <button
                    type="button"
                    onClick={() => setShowPresets(!showPresets)}
                    className="w-full py-1.5 px-3 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>{showPresets ? 'पर्याय लपवा' : (lang === 'mr' ? 'तयार खाद्य फोटो निवडा (Presets)' : 'Choose from Presets')}</span>
                  </button>
                </div>
              </div>

              {/* Preset Photos Carousel */}
              {showPresets && (
                <div className="pt-2 border-t border-slate-200">
                  <span className="text-[10px] font-bold text-slate-500 block mb-1.5">
                    {lang === 'mr' ? 'फोटोवर क्लिक करून त्वरित निवडा:' : 'Click a photo to select:'}
                  </span>
                  <div className="grid grid-cols-5 gap-2 max-h-36 overflow-y-auto p-1 bg-white rounded-xl border border-slate-200">
                    {PRESET_PHOTOS.map((preset, idx) => (
                      <button
                        type="button"
                        key={idx}
                        onClick={() => {
                          setNewItem(prev => ({ ...prev, image: preset.url }));
                          setShowPresets(false);
                        }}
                        className="group relative rounded-lg overflow-hidden border hover:border-emerald-600 transition-all text-left"
                      >
                        <img
                          src={preset.url}
                          alt={preset.label}
                          className="w-full h-12 object-cover group-hover:scale-105 transition-transform"
                        />
                        <span className="text-[9px] font-bold text-slate-700 truncate block p-0.5 bg-white/90">
                          {preset.label.split('/')[0]}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Or Paste URL */}
              <div>
                <input
                  type="url"
                  placeholder={lang === 'mr' ? 'किंवा फोटोची लिंक (URL) येथे पेस्ट करा...' : 'Or paste image URL...'}
                  value={newItem.image}
                  onChange={(e) => setNewItem({ ...newItem, image: e.target.value })}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-[11px] text-slate-600"
                />
              </div>
            </div>

            {/* Dish Names: Marathi & English */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  {lang === 'mr' ? 'पदार्थाचे मराठी नाव *' : 'Marathi Dish Name *'}
                </label>
                <input
                  type="text"
                  required
                  placeholder={lang === 'mr' ? 'उदा. पनीर बटर मसाला' : 'e.g. पनीर बटर मसाला'}
                  value={newItem.marathiName}
                  onChange={(e) => setNewItem({ ...newItem, marathiName: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  {lang === 'mr' ? 'इंग्रजी नाव (English Name)' : 'English Dish Name'}
                </label>
                <input
                  type="text"
                  placeholder="e.g. Paneer Butter Masala"
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  {lang === 'mr' ? 'वर्ग (Category)' : 'Category'}
                </label>
                <select
                  value={newItem.category}
                  onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white"
                >
                  {categories.filter(c => c !== 'All').map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  {lang === 'mr' ? 'किंमत (₹)' : 'Price (₹)'}
                </label>
                <input
                  type="number"
                  required
                  placeholder="240"
                  value={newItem.price}
                  onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-mono font-bold"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                {lang === 'mr' ? 'आहार प्रकार' : 'Dietary Preference'}
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 cursor-pointer">
                  <input
                    type="radio"
                    name="isVeg"
                    checked={newItem.isVeg}
                    onChange={() => setNewItem({ ...newItem, isVeg: true })}
                  />
                  <span>शाकाहारी (Pure Veg 🟢)</span>
                </label>
                <label className="flex items-center gap-1.5 text-xs font-bold text-rose-800 cursor-pointer">
                  <input
                    type="radio"
                    name="isVeg"
                    checked={!newItem.isVeg}
                    onChange={() => setNewItem({ ...newItem, isVeg: false })}
                  />
                  <span>मांसाहारी (Non-Veg 🔴)</span>
                </label>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                {lang === 'mr' ? 'माहिती / वर्णन (Description)' : 'Description'}
              </label>
              <textarea
                rows="2"
                placeholder={lang === 'mr' ? 'अस्सल मसाले, चविष्ट ग्रेव्ही...' : 'Fresh ingredients, signature spices...'}
                value={newItem.description}
                onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs"
              />
            </div>

            <div className="flex gap-2 pt-2 border-t border-slate-100">
              <button
                type="submit"
                className="flex-1 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-black rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                {lang === 'mr' ? 'मेनूमध्ये सेव्ह करा' : 'Save & Add Dish'}
              </button>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs"
              >
                {lang === 'mr' ? 'रद्द करा' : 'Cancel'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
