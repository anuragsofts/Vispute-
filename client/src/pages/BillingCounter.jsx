import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useRestaurant } from '../context/RestaurantContext';
import { QRCodeSVG } from 'qrcode.react';
import { 
  Receipt, 
  CreditCard, 
  Banknote, 
  QrCode, 
  Printer, 
  Lock, 
  Unlock, 
  Check, 
  X, 
  History, 
  Search, 
  FileText, 
  Percent, 
  Keyboard, 
  ArrowRight,
  Sparkles
} from 'lucide-react';

const BILLING_PIN = '432156';

export const BillingCounter = ({ initialSelectedTable = null }) => {
  const { tables, bills, settleBill, showNotification, lang } = useRestaurant();

  // Password Unlock State (PIN: 432156)
  const [isUnlocked, setIsUnlocked] = useState(() => {
    return sessionStorage.getItem('vispute_billing_auth') === 'true';
  });
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);

  // Table selection & active bill
  const [selectedTableId, setSelectedTableId] = useState(() => {
    if (initialSelectedTable) return initialSelectedTable.id;
    const req = tables.find(t => t.status === 'bill_requested');
    if (req) return req.id;
    const occ = tables.find(t => t.activeSession);
    if (occ) return occ.id;
    return tables[0]?.id || 'T1';
  });

  const [activeTab, setActiveTab] = useState('billing'); // 'billing' or 'history'
  const [paymentMethod, setPaymentMethod] = useState('UPI'); // 'Cash', 'UPI', 'Card'
  const [cashTendered, setCashTendered] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [cashierNotes, setCashierNotes] = useState('');
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [settledBillResult, setSettledBillResult] = useState(null);
  const [isSettling, setIsSettling] = useState(false);
  const [historySearch, setHistorySearch] = useState('');

  const cashInputRef = useRef(null);

  const selectedTable = tables.find(t => t.id === selectedTableId) || tables[0];
  const activeSession = selectedTable?.activeSession;

  // Flatten all items across all rounds for this table
  const consolidatedItems = useMemo(() => {
    if (!activeSession?.rounds) return [];
    const items = [];
    activeSession.rounds.forEach(round => {
      round.items.forEach(item => {
        items.push({
          ...item,
          roundNumber: round.roundNumber,
          lineTotal: item.price * item.quantity
        });
      });
    });
    return items;
  }, [activeSession]);

  // Financial Calculations
  const subtotal = consolidatedItems.reduce((sum, item) => sum + item.lineTotal, 0);
  const discount = discountPercent > 0 
    ? Math.round((subtotal * discountPercent) / 100)
    : Number(discountAmount) || 0;

  const discountedSubtotal = Math.max(0, subtotal - discount);
  const cgst = Math.round((discountedSubtotal * 0.025) * 100) / 100; // 2.5% CGST
  const sgst = Math.round((discountedSubtotal * 0.025) * 100) / 100; // 2.5% SGST
  const totalTax = cgst + sgst;
  const grandTotal = Math.round(discountedSubtotal + totalTax);

  // Cash change
  const cashGiven = Number(cashTendered) || 0;
  const cashChange = Math.max(0, cashGiven - grandTotal);

  // Dynamic UPI payment URL for GPay / PhonePe / Paytm
  const upiPayString = `upi://pay?pa=visputefoodcourt@icici&pn=Vispute%20Food%20Court&am=${grandTotal}&cu=INR&tn=Table%20${selectedTable?.tableNumber}%20Bill`;

  // --- PIN VERIFICATION ---
  const handlePinDigit = (digit) => {
    if (pinInput.length < 6) {
      const nextPin = pinInput + digit;
      setPinInput(nextPin);
      setPinError(false);
      if (nextPin.length === 6) {
        verifyPin(nextPin);
      }
    }
  };

  const handlePinBackspace = () => {
    setPinInput(prev => prev.slice(0, -1));
    setPinError(false);
  };

  const verifyPin = (pinToTest) => {
    if (pinToTest === BILLING_PIN) {
      setIsUnlocked(true);
      sessionStorage.setItem('vispute_billing_auth', 'true');
      setPinInput('');
      setPinError(false);
      showNotification('✅ बिलिंग काउंटर अनलॉक झाले! (Billing Counter Unlocked)', 'success');
    } else {
      setPinError(true);
      setPinInput('');
      showNotification('❌ चुकीचा पासवर्ड! कृपया योग्य पासवर्ड (432156) टाका.', 'error');
    }
  };

  const lockCounter = () => {
    setIsUnlocked(false);
    sessionStorage.removeItem('vispute_billing_auth');
    setPinInput('');
    showNotification('🔒 बिलिंग काउंटर लॉक केले आहे', 'info');
  };

  // --- SETTLE BILL & FREE TABLE ---
  const handleSettle = async () => {
    if (!activeSession || consolidatedItems.length === 0) {
      showNotification('या टेबलवर कोणतेही चालू बिल नाही (No active items to bill)', 'error');
      return;
    }

    setIsSettling(true);
    try {
      const bill = await settleBill({
        tableId: selectedTable.id,
        paymentMethod,
        discountPercent,
        discountAmount: discount,
        notes: cashierNotes
      });

      setSettledBillResult(bill);
      setShowReceiptModal(true);
      setCashTendered('');
      setCashierNotes('');
      setDiscountPercent(0);
      setDiscountAmount(0);
      showNotification(`🎉 टेबल #${selectedTable.tableNumber} चे बिल जमा झाले! टेबल आता नवीन ग्राहकांसाठी मोकळे झाले आहे.`, 'success');
    } catch (err) {
      showNotification(err.message, 'error');
    } finally {
      setIsSettling(false);
    }
  };

  // --- 100% KEYBOARD NAVIGATION SHORTCUTS ---
  useEffect(() => {
    const handleKeyDown = (e) => {
      // If billing is locked: handle PIN entry via physical keyboard
      if (!isUnlocked) {
        if (/^[0-9]$/.test(e.key)) {
          handlePinDigit(e.key);
        } else if (e.key === 'Backspace') {
          handlePinBackspace();
        }
        return;
      }

      // If typing in an input box (like cash tendered or notes), allow normal typing unless it's Enter
      const activeTagName = document.activeElement?.tagName?.toLowerCase();
      const isInputFocused = activeTagName === 'input' || activeTagName === 'textarea';

      // Global shortcuts
      if (e.key === 'Escape') {
        if (showReceiptModal) setShowReceiptModal(false);
        return;
      }

      if (e.key === 'l' || e.key === 'L') {
        if (!isInputFocused) {
          e.preventDefault();
          lockCounter();
          return;
        }
      }

      if (e.key === 'p' || e.key === 'P') {
        if (!isInputFocused && (showReceiptModal || settledBillResult)) {
          e.preventDefault();
          window.print();
          return;
        }
      }

      // Enter key: Settle bill
      if (e.key === 'Enter') {
        if (!showReceiptModal && consolidatedItems.length > 0 && !isSettling) {
          e.preventDefault();
          handleSettle();
          return;
        }
      }

      // Quick numbers 1 to 9: Directly switch tables!
      if (!isInputFocused && /^[1-9]$/.test(e.key)) {
        const tableNum = Number(e.key);
        const targetTable = tables.find(t => t.tableNumber === tableNum);
        if (targetTable) {
          e.preventDefault();
          setSelectedTableId(targetTable.id);
          showNotification(`टेबल #${tableNum} निवडले`, 'info');
        }
        return;
      }

      // 'c' or 'C': Switch to Cash & focus cash input
      if (!isInputFocused && (e.key === 'c' || e.key === 'C')) {
        e.preventDefault();
        setPaymentMethod('Cash');
        setTimeout(() => cashInputRef.current?.focus(), 50);
        return;
      }

      // 'u' or 'U': Switch to UPI QR code
      if (!isInputFocused && (e.key === 'u' || e.key === 'U')) {
        e.preventDefault();
        setPaymentMethod('UPI');
        return;
      }

      // 'd' or 'D': Switch to Card
      if (!isInputFocused && (e.key === 'd' || e.key === 'D')) {
        e.preventDefault();
        setPaymentMethod('Card');
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isUnlocked, pinInput, showReceiptModal, consolidatedItems, isSettling, tables]);

  // --- RENDER PIN LOCK SCREEN IF LOCKED ---
  if (!isUnlocked) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-[#f1f5f9] p-4 select-none">
        <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 flex flex-col items-center animate-in zoom-in-95">
          <div className="w-16 h-16 rounded-2xl bg-slate-900 text-emerald-400 flex items-center justify-center mb-3 shadow-lg">
            <Lock className="w-8 h-8" />
          </div>

          <h2 className="text-xl font-black text-slate-800 text-center">
            बिलिंग काउंटर सुरक्षा लॉक
          </h2>
          <p className="text-xs text-slate-500 text-center mt-1">
            कॅशियर पासवर्ड टाका <span className="font-mono font-bold text-slate-700">(432156)</span>
          </p>

          {/* PIN Dots (6 circles) */}
          <div className="flex items-center gap-3 my-6">
            {[0, 1, 2, 3, 4, 5].map((idx) => {
              const isFilled = pinInput.length > idx;
              return (
                <div
                  key={idx}
                  className={`w-4 h-4 rounded-full transition-all ${
                    pinError
                      ? 'bg-rose-500 scale-110'
                      : isFilled
                      ? 'bg-emerald-600 scale-110'
                      : 'bg-slate-200 border border-slate-300'
                  }`}
                />
              );
            })}
          </div>

          {pinError && (
            <div className="mb-4 text-xs font-bold text-rose-600 bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-xl text-center animate-bounce">
              ❌ चुकीचा पासवर्ड! कृपया पुन्हा टाका.
            </div>
          )}

          {/* On-Screen Touch Numpad */}
          <div className="grid grid-cols-3 gap-2.5 w-full">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
              <button
                key={digit}
                type="button"
                onClick={() => handlePinDigit(digit)}
                className="h-14 bg-slate-50 hover:bg-slate-100 active:bg-slate-200 rounded-2xl font-black text-xl text-slate-800 shadow-2xs border border-slate-200 transition-all flex items-center justify-center"
              >
                {digit}
              </button>
            ))}
            <button
              type="button"
              onClick={() => {
                setPinInput('');
                setPinError(false);
              }}
              className="h-14 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-2xl font-bold text-xs shadow-2xs border border-rose-200 transition-all flex items-center justify-center"
            >
              पुसा (C)
            </button>
            <button
              type="button"
              onClick={() => handlePinDigit('0')}
              className="h-14 bg-slate-50 hover:bg-slate-100 active:bg-slate-200 rounded-2xl font-black text-xl text-slate-800 shadow-2xs border border-slate-200 transition-all flex items-center justify-center"
            >
              0
            </button>
            <button
              type="button"
              onClick={handlePinBackspace}
              className="h-14 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-bold text-xs shadow-2xs border border-slate-200 transition-all flex items-center justify-center"
            >
              ⌫ मागचे
            </button>
          </div>

          <p className="text-[10px] text-slate-400 mt-4 text-center">
            कीबोर्डवरील अंक (Numpad) दाबूनही पासवर्ड टाकू शकता
          </p>
        </div>
      </div>
    );
  }

  // --- UNLOCKED: MAIN BILLING COUNTER VIEW ---
  return (
    <div className="flex flex-col h-full bg-[#f8fafc] select-none">
      {/* Top Header */}
      <div className="bg-white border-b border-slate-200 px-4 md:px-6 py-2.5 flex items-center justify-between shrink-0 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-900 text-emerald-400 flex items-center justify-center shadow-xs font-black text-lg">
            ₹
          </div>
          <div>
            <h1 className="text-base md:text-lg font-black text-slate-800 flex items-center gap-2">
              कॅशियर बिलिंग काउंटर (Billing Counter)
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                अनलॉक (सुरक्षित)
              </span>
            </h1>
            <p className="text-[11px] text-slate-500">
              सोपे बिलिंग • कीबोर्ड शॉर्टकट • पैसे भरताच टेबल मोकळे होते
            </p>
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-2">
          {/* History / Live Toggle */}
          <div className="flex bg-slate-100 p-0.5 rounded-xl text-xs font-bold">
            <button
              onClick={() => setActiveTab('billing')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'billing' ? 'bg-white shadow-xs text-slate-900 font-black' : 'text-slate-600'
              }`}
            >
              चालू बिलिंग
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'history' ? 'bg-white shadow-xs text-slate-900 font-black' : 'text-slate-600'
              }`}
            >
              जमा बिले ({bills.length})
            </button>
          </div>

          {/* Lock Button */}
          <button
            onClick={lockCounter}
            className="p-1.5 bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 rounded-xl border border-slate-200 text-xs font-bold transition-all flex items-center gap-1"
            title="काउंटर लॉक करा (Lock [L])"
          >
            <Lock className="w-4 h-4" />
            <span className="hidden sm:inline">लॉक [L]</span>
          </button>
        </div>
      </div>

      {activeTab === 'billing' ? (
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          
          {/* LEFT: TABLE SELECTOR STRIP (1 to 12) */}
          <div className="w-full lg:w-72 bg-white border-r border-slate-200 flex flex-col overflow-hidden shrink-0">
            <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-500">
                टेबल निवडा [1-9 दाबा]
              </span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full font-mono">
                {tables.filter(t => t.activeSession).length} चालू
              </span>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
              {tables.map(table => {
                const isSelected = table.id === selectedTableId;
                const isBillReq = table.status === 'bill_requested';
                return (
                  <button
                    key={table.id}
                    type="button"
                    onClick={() => setSelectedTableId(table.id)}
                    className={`w-full p-2.5 rounded-xl cursor-pointer transition-all flex items-center justify-between text-left border ${
                      isSelected
                        ? 'bg-emerald-600 text-white border-emerald-700 shadow-md scale-[1.01]'
                        : isBillReq
                        ? 'bg-rose-50 border-rose-300 text-rose-950 animate-pulse'
                        : table.currentBillTotal > 0
                        ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950 hover:bg-emerald-100/60'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className={`w-8 h-8 rounded-lg font-black text-xs flex items-center justify-center shrink-0 ${
                        isSelected ? 'bg-white text-emerald-800' :
                        isBillReq ? 'bg-rose-600 text-white' :
                        table.currentBillTotal > 0 ? 'bg-emerald-600 text-white' :
                        'bg-slate-200 text-slate-600'
                      }`}>
                        T{table.tableNumber}
                      </span>
                      <div className="min-w-0">
                        <div className={`font-bold text-xs truncate ${isSelected ? 'text-white' : 'text-slate-800'}`}>
                          {table.name}
                        </div>
                        <div className={`text-[10px] truncate ${isSelected ? 'text-emerald-100' : 'text-slate-400'}`}>
                          {table.currentGuestName || 'मोकळे'}
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      {table.currentBillTotal > 0 ? (
                        <div>
                          <div className={`text-xs font-black font-mono ${isSelected ? 'text-white' : 'text-emerald-700'}`}>
                            ₹{table.currentBillTotal}
                          </div>
                          {isBillReq && (
                            <span className="text-[9px] bg-rose-600 text-white px-1.5 py-0.2 rounded font-black uppercase">
                              बिल मागितले
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className={`text-[10px] ${isSelected ? 'text-emerald-100' : 'text-slate-400'}`}>
                          मोकळे
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* CENTER: BILL ITEMIZED DETAILS */}
          <div className="flex-1 flex flex-col bg-slate-50 overflow-hidden border-r border-slate-200">
            {/* Table Details Bar */}
            <div className="p-4 bg-white border-b border-slate-200 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-black text-slate-900">
                    {selectedTable?.name} ({selectedTable?.section})
                  </h2>
                  <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase ${
                    selectedTable?.status === 'bill_requested' ? 'bg-rose-100 text-rose-800 border border-rose-300' :
                    selectedTable?.activeSession ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                    'bg-slate-100 text-slate-600'
                  }`}>
                    {selectedTable?.status === 'bill_requested' ? 'बिल मागितले आहे' :
                     selectedTable?.activeSession ? 'ग्राहक चालू आहेत' : 'टेबल मोकळे आहे'}
                  </span>
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  ग्राहक: <strong>{selectedTable?.currentGuestName || 'कुणी नाही'}</strong>
                  {selectedTable?.activeSession && (
                    <span className="ml-2 font-mono text-[11px]">
                      • {activeSession.rounds?.length || 1} ऑर्डर्स
                    </span>
                  )}
                </div>
              </div>

              {consolidatedItems.length > 0 && (
                <div className="text-right">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">एकूण वस्तू</span>
                  <div className="text-sm font-black text-slate-800">
                    {consolidatedItems.reduce((acc, i) => acc + i.quantity, 0)} आयटम
                  </div>
                </div>
              )}
            </div>

            {/* Items Table */}
            <div className="flex-1 overflow-y-auto p-4">
              {consolidatedItems.length === 0 ? (
                <div className="h-64 flex flex-col items-center justify-center text-center bg-white rounded-2xl border border-dashed border-slate-300 p-8">
                  <Receipt className="w-12 h-12 text-slate-300 mb-2" />
                  <p className="font-bold text-sm text-slate-700">या टेबलवर कोणतीही चालू ऑर्डर नाही</p>
                  <p className="text-xs text-slate-400 mt-1">टेबल मोकळे आहे. ऑर्डर आल्यावर येथे आपोआप बिल तयार होईल.</p>
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 text-slate-700 uppercase font-black text-[10px] tracking-wider border-b border-slate-200">
                      <tr>
                        <th className="p-3">पदार्थाचे नाव (Dish)</th>
                        <th className="p-3 text-center">फेरी</th>
                        <th className="p-3 text-center">संख्या (Qty)</th>
                        <th className="p-3 text-right">दर</th>
                        <th className="p-3 text-right">रक्कम</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {consolidatedItems.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="p-3">
                            <div className="flex items-center gap-1.5 font-bold text-slate-800">
                              <span className={`w-2 h-2 rounded-full ${item.isVeg ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                              <span>{item.name}</span>
                            </div>
                            {item.notes && (
                              <span className="text-[10px] text-amber-700 block mt-0.5">
                                सूचना: {item.notes}
                              </span>
                            )}
                          </td>
                          <td className="p-3 text-center font-mono text-slate-400">
                            R{item.roundNumber}
                          </td>
                          <td className="p-3 text-center font-bold text-slate-900">
                            {item.quantity}
                          </td>
                          <td className="p-3 text-right font-mono text-slate-600">
                            ₹{item.price}
                          </td>
                          <td className="p-3 text-right font-mono font-black text-slate-900">
                            ₹{item.lineTotal}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: FAST SIMPLE CHECKOUT (PAYMENT MODES & SETTLE BUTTON) */}
          <div className="w-full lg:w-96 bg-white flex flex-col justify-between overflow-y-auto border-l border-slate-200 p-5 space-y-4 shrink-0">
            <div>
              {/* Financial Box */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>उप-एकूण (Subtotal):</span>
                  <span className="font-mono font-bold text-slate-800">₹{subtotal}</span>
                </div>

                {/* Discount */}
                <div className="flex items-center justify-between py-1 border-y border-slate-200">
                  <span className="text-slate-600 flex items-center gap-1">
                    <Percent className="w-3.5 h-3.5 text-slate-400" /> सूट / Discount (%):
                  </span>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={discountPercent}
                      onChange={(e) => setDiscountPercent(Number(e.target.value))}
                      className="w-14 px-2 py-0.5 bg-white border border-slate-300 rounded text-right font-mono text-xs"
                    />
                    <span className="font-mono font-bold text-rose-600">
                      -₹{discount}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between text-slate-500 text-[11px]">
                  <span>जीएसटी कर (GST 5%):</span>
                  <span className="font-mono text-slate-700">₹{totalTax}</span>
                </div>

                {/* BIG GRAND TOTAL BOX */}
                <div className="p-3 bg-emerald-600 text-white rounded-xl shadow-md flex items-center justify-between mt-2">
                  <span className="font-black text-xs uppercase tracking-wide">
                    एकूण भरायची रक्कम:
                  </span>
                  <span className="font-black font-mono text-2xl">
                    ₹{grandTotal}
                  </span>
                </div>
              </div>

              {/* Payment Mode Selector with Keyboard Keys */}
              <div className="mt-4">
                <label className="text-[11px] font-black text-slate-600 uppercase tracking-wider block mb-2">
                  पैसे भरण्याची पद्धत निवडा:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {/* UPI */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('UPI')}
                    className={`py-2.5 px-2 rounded-xl border text-xs font-black flex flex-col items-center gap-1 transition-all ${
                      paymentMethod === 'UPI'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-800 shadow-sm ring-2 ring-emerald-500/20'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <QrCode className="w-5 h-5 text-emerald-600" />
                    <span>UPI / QR</span>
                    <span className="text-[9px] text-slate-400 font-mono">[U]</span>
                  </button>

                  {/* Cash */}
                  <button
                    type="button"
                    onClick={() => {
                      setPaymentMethod('Cash');
                      setTimeout(() => cashInputRef.current?.focus(), 50);
                    }}
                    className={`py-2.5 px-2 rounded-xl border text-xs font-black flex flex-col items-center gap-1 transition-all ${
                      paymentMethod === 'Cash'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-800 shadow-sm ring-2 ring-emerald-500/20'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Banknote className="w-5 h-5 text-emerald-600" />
                    <span>रोख (Cash)</span>
                    <span className="text-[9px] text-slate-400 font-mono">[C]</span>
                  </button>

                  {/* Card */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('Card')}
                    className={`py-2.5 px-2 rounded-xl border text-xs font-black flex flex-col items-center gap-1 transition-all ${
                      paymentMethod === 'Card'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-800 shadow-sm ring-2 ring-emerald-500/20'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <CreditCard className="w-5 h-5 text-emerald-600" />
                    <span>कार्ड</span>
                    <span className="text-[9px] text-slate-400 font-mono">[D]</span>
                  </button>
                </div>
              </div>

              {/* UPI QR Display */}
              {paymentMethod === 'UPI' && grandTotal > 0 && (
                <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex flex-col items-center text-center">
                  <div className="bg-white p-2 rounded-xl shadow-xs border border-slate-200">
                    <QRCodeSVG
                      value={upiPayString}
                      size={120}
                      level="M"
                      includeMargin={false}
                    />
                  </div>
                  <div className="mt-1.5 text-xs font-black text-emerald-950 font-mono">
                    ₹{grandTotal} स्कॅन करा
                  </div>
                  <span className="text-[10px] text-emerald-700">
                    PhonePe • GPay • Paytm
                  </span>
                </div>
              )}

              {/* Cash Calculator */}
              {paymentMethod === 'Cash' && grandTotal > 0 && (
                <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 text-xs">
                  <label className="font-bold text-slate-700 block">
                    ग्राहकाने दिलेली रक्कम (₹):
                  </label>
                  <input
                    ref={cashInputRef}
                    type="number"
                    placeholder="उदा. 500, 1000..."
                    value={cashTendered}
                    onChange={(e) => setCashTendered(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-mono text-base font-bold text-slate-900"
                  />
                  {cashGiven >= grandTotal && (
                    <div className="p-2.5 bg-emerald-100 text-emerald-900 rounded-xl flex items-center justify-between font-black">
                      <span>परत करायची रक्कम:</span>
                      <span className="font-mono text-base">₹{cashChange}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* BIG ACTION: SETTLE & FREE TABLE BUTTON */}
            <div className="pt-2 border-t border-slate-200 space-y-2">
              <button
                type="button"
                disabled={consolidatedItems.length === 0 || isSettling}
                onClick={handleSettle}
                className="w-full py-4 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-black rounded-2xl text-sm shadow-lg shadow-emerald-700/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Check className="w-5 h-5" />
                <span>
                  {isSettling ? 'बिल जमा होत आहे...' : `पैसे जमा करा आणि टेबल मोकळे करा [Enter]`}
                </span>
              </button>
              <p className="text-[10px] text-center text-slate-400">
                बिल भरल्यानंतर टेबल पूर्ण मोकळे होते आणि नवीन ग्राहकांसाठी लगेच उपलब्ध होते.
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* Settlement History Tab */
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="max-w-5xl mx-auto space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-slate-800">
                  आज जमा झालेली बिले (Invoices History)
                </h3>
                <p className="text-xs text-slate-500">
                  सर्व जुन्या पावत्यांचा संग्रह आणि पुन्हा प्रिंट करण्याचे पर्याय
                </p>
              </div>

              <div className="relative w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="पावती किंवा नाव शोधा..."
                  value={historySearch}
                  onChange={(e) => setHistorySearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs"
                />
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 uppercase font-black text-[10px] tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="p-3">पावती #</th>
                    <th className="p-3">टेबल</th>
                    <th className="p-3">ग्राहक</th>
                    <th className="p-3">वेळ</th>
                    <th className="p-3">पेमेंट</th>
                    <th className="p-3 text-right">एकूण रक्कम</th>
                    <th className="p-3 text-center">पावती</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {bills
                    .filter(b => !historySearch || b.invoiceNumber.toLowerCase().includes(historySearch.toLowerCase()) || (b.guestName && b.guestName.toLowerCase().includes(historySearch.toLowerCase())))
                    .map((bill) => (
                      <tr key={bill.id} className="hover:bg-slate-50">
                        <td className="p-3 font-mono font-bold text-slate-800">{bill.invoiceNumber}</td>
                        <td className="p-3 font-bold text-slate-800">Table {bill.tableNumber}</td>
                        <td className="p-3 text-slate-600">{bill.guestName || 'ग्राहक'}</td>
                        <td className="p-3 text-slate-500 font-mono text-[11px]">
                          {new Date(bill.settledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                            {bill.paymentMethod}
                          </span>
                        </td>
                        <td className="p-3 text-right font-mono font-black text-emerald-700 text-sm">
                          ₹{bill.grandTotal}
                        </td>
                        <td className="p-3 text-center">
                          <button
                            type="button"
                            onClick={() => {
                              setSettledBillResult(bill);
                              setShowReceiptModal(true);
                            }}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700"
                            title="पावती पाहा / प्रिंट करा"
                          >
                            <FileText className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* KEYBOARD SHORTCUTS BAR ACROSS BOTTOM */}
      <div className="bg-slate-900 text-slate-300 px-4 py-2 text-[11px] font-bold flex flex-wrap items-center justify-between gap-3 border-t border-slate-800 shrink-0">
        <div className="flex items-center gap-1.5 text-emerald-400">
          <Keyboard className="w-4 h-4" />
          <span>कीबोर्ड शॉर्टकट (Keyboard Supported):</span>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <span><kbd className="bg-slate-800 text-white px-1.5 py-0.5 rounded border border-slate-700">1-9</kbd> टेबल निवडा</span>
          <span><kbd className="bg-slate-800 text-white px-1.5 py-0.5 rounded border border-slate-700">C</kbd> रोख (Cash)</span>
          <span><kbd className="bg-slate-800 text-white px-1.5 py-0.5 rounded border border-slate-700">U</kbd> UPI स्कॅनर</span>
          <span><kbd className="bg-slate-800 text-white px-1.5 py-0.5 rounded border border-slate-700">Enter</kbd> बिल पूर्ण करा</span>
          <span><kbd className="bg-slate-800 text-white px-1.5 py-0.5 rounded border border-slate-700">P</kbd> पावती प्रिंट</span>
          <span><kbd className="bg-slate-800 text-white px-1.5 py-0.5 rounded border border-slate-700">L</kbd> काउंटर लॉक</span>
          <span><kbd className="bg-slate-800 text-white px-1.5 py-0.5 rounded border border-slate-700">Esc</kbd> बंद करा</span>
        </div>
      </div>

      {/* OFFICIAL MARATHI RECEIPT / TAX INVOICE MODAL */}
      {showReceiptModal && settledBillResult && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl animate-in zoom-in-95 flex flex-col max-h-[90vh]">
            <div id="printable-receipt" className="flex-1 overflow-y-auto p-4 bg-slate-50 rounded-2xl border border-dashed border-slate-300 font-mono text-xs text-slate-800 space-y-3">
              {/* Receipt Header */}
              <div className="text-center border-b border-slate-300 pb-3">
                <h2 className="font-black text-base tracking-wider uppercase">
                  विस्पुते फूड कोर्ट
                </h2>
                <p className="text-[10px] text-slate-500">
                  हॉटेल आणि रेस्टॉरंट • Vispute Food Court
                </p>
                <p className="text-[10px] text-slate-500">
                  GSTIN: 27AABCV1234F1Z8
                </p>
                <div className="mt-2 text-[10px] font-bold">
                  कर पावती / TAX INVOICE: {settledBillResult.invoiceNumber}
                </div>
              </div>

              {/* Meta */}
              <div className="text-[10px] space-y-0.5 border-b border-slate-300 pb-2">
                <div className="flex justify-between">
                  <span>टेबल: #{settledBillResult.tableNumber}</span>
                  <span>तारीख: {new Date(settledBillResult.settledAt).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>ग्राहक: {settledBillResult.guestName}</span>
                  <span>वेळ: {new Date(settledBillResult.settledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div className="flex justify-between">
                  <span>पेमेंट पद्धत: {settledBillResult.paymentMethod}</span>
                  <span className="font-bold text-emerald-800">स्थिती: जमा (PAID)</span>
                </div>
              </div>

              {/* Items */}
              <div className="divide-y divide-slate-200 py-1">
                {settledBillResult.items?.map((item, i) => (
                  <div key={i} className="py-1 flex justify-between text-[11px]">
                    <span className="flex-1 truncate mr-2">
                      {item.quantity}× {item.name}
                    </span>
                    <span className="font-bold">
                      ₹{item.lineTotal || (item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="border-t border-slate-300 pt-2 space-y-1 text-[11px]">
                <div className="flex justify-between">
                  <span>उप-एकूण:</span>
                  <span>₹{settledBillResult.subtotal}</span>
                </div>
                {settledBillResult.discount > 0 && (
                  <div className="flex justify-between text-rose-600">
                    <span>सूट (Discount):</span>
                    <span>-₹{settledBillResult.discount}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-500 text-[10px]">
                  <span>जीएसटी कर (GST 5%):</span>
                  <span>₹{settledBillResult.totalTax}</span>
                </div>
                <div className="flex justify-between font-black text-sm pt-1 border-t border-slate-400">
                  <span>एकूण भरायची रक्कम:</span>
                  <span>₹{settledBillResult.grandTotal}</span>
                </div>
              </div>

              {/* Footer */}
              <div className="text-center text-[10px] text-slate-500 pt-2 border-t border-slate-300">
                <p>विस्पुते फूड कोर्टला भेट दिल्याबद्दल धन्यवाद!</p>
                <p>पुन्हा भेट द्या! 🙏 Visit Again</p>
              </div>
            </div>

            {/* Buttons */}
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5"
              >
                <Printer className="w-4 h-4" /> पावती प्रिंट करा [P]
              </button>
              <button
                type="button"
                onClick={() => setShowReceiptModal(false)}
                className="px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl text-xs"
              >
                बंद करा [Esc]
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
