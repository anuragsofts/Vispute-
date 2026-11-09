import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { QrCode, Printer, X, Download, ExternalLink } from 'lucide-react';

export const QRModal = ({ table, onClose, onOpenCustomerView }) => {
  if (!table) return null;

  // The URL encoded in the QR code (points to customer order page for this table)
  const orderUrl = `${window.location.origin}/?tab=customer&table=${table.tableNumber}`;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl animate-in zoom-in-95 flex flex-col items-center">
        {/* Header */}
        <div className="w-full flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-emerald-600" />
            <h3 className="font-black text-sm text-slate-800">
              Table #{table.tableNumber} QR Tent Card
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* The Printable Table QR Card */}
        <div className="my-5 p-5 bg-white border-2 border-slate-900 rounded-2xl shadow-md flex flex-col items-center text-center max-w-[260px]">
          <div className="w-8 h-8 rounded-lg bg-emerald-800 text-white font-black text-xs flex items-center justify-center mb-1">
            VF
          </div>
          <h4 className="font-black text-xs text-slate-900 tracking-wide uppercase">
            Vispute Food Court
          </h4>
          <span className="text-[10px] text-slate-500 mb-3">
            Scan to Order & Dine
          </span>

          <div className="p-2.5 bg-white border border-slate-200 rounded-xl shadow-xs">
            <QRCodeSVG
              value={orderUrl}
              size={170}
              level="H"
              includeMargin={false}
            />
          </div>

          <div className="mt-3 px-3 py-1 bg-emerald-100 text-emerald-900 rounded-full font-black text-xs">
            TABLE #{table.tableNumber}
          </div>
          <p className="text-[9px] text-slate-400 mt-1">
            Order repeatedly anytime during your meal!
          </p>
        </div>

        {/* Action Buttons */}
        <div className="w-full space-y-2">
          <button
            onClick={() => {
              onOpenCustomerView(table.tableNumber);
              onClose();
            }}
            className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs"
          >
            <ExternalLink className="w-4 h-4" /> Open Customer Mobile View
          </button>

          <button
            onClick={() => window.print()}
            className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5"
          >
            <Printer className="w-4 h-4" /> Print Tent Card
          </button>
        </div>
      </div>
    </div>
  );
};
