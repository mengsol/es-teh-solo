"use client";

import type { CartItem } from "./Cart";
import Logo from "./Logo";

interface ReceiptProps {
  items: CartItem[];
  payAmount: number;
  onClose: () => void;
  orderNumber: number;
}

export default function Receipt({ items, payAmount, onClose, orderNumber }: ReceiptProps) {
  const total = items.reduce((sum, i) => sum + i.price * i.qty, 0);
  const change = payAmount - total;
  const now = new Date();

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden">
        <div id="receipt-print" className="p-6 space-y-4">
          <div className="flex flex-col items-center gap-1">
            <Logo size={80} />
            <p className="text-gray-500 text-xs mt-1">
              {now.toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" })}{" "}
              {now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
            </p>
            <p className="text-navy font-bold text-sm">Order #{String(orderNumber).padStart(4, "0")}</p>
          </div>

          <div className="border-t border-dashed border-gray-300" />

          <div className="space-y-1">
            {items.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span className="text-gray-700">
                  {item.name} x{item.qty}
                </span>
                <span className="text-navy font-medium">
                  Rp {(item.price * item.qty).toLocaleString("id-ID")}
                </span>
              </div>
            ))}
          </div>

          <div className="border-t border-dashed border-gray-300" />

          <div className="space-y-1">
            <div className="flex justify-between font-bold text-navy">
              <span>Total</span>
              <span>Rp {total.toLocaleString("id-ID")}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>Bayar</span>
              <span>Rp {payAmount.toLocaleString("id-ID")}</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-primary">
              <span>Kembalian</span>
              <span>Rp {change.toLocaleString("id-ID")}</span>
            </div>
          </div>

          <div className="border-t border-dashed border-gray-300" />
          <p className="text-center text-gray-400 text-xs">Terima kasih sudah mampir! 🍵</p>
        </div>

        <div className="flex border-t border-gray-200">
          <button
            onClick={() => window.print()}
            className="flex-1 py-3 text-primary font-bold text-sm border-r border-gray-200 active:bg-gray-50"
          >
            🖨️ Cetak
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-3 text-white bg-primary font-bold text-sm active:bg-primary-dark"
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
}
