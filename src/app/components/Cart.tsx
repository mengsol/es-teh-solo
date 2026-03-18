"use client";

import type { MenuItem } from "./MenuCard";

export interface CartItem extends MenuItem {
  qty: number;
}

interface CartProps {
  items: CartItem[];
  onIncrease: (id: string) => void;
  onDecrease: (id: string) => void;
  onClear: () => void;
  onCheckout: () => void;
}

export default function Cart({ items, onIncrease, onDecrease, onClear, onCheckout }: CartProps) {
  const total = items.reduce((sum, i) => sum + i.price * i.qty, 0);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
        <h2 className="text-navy font-bold text-lg">🛒 Pesanan</h2>
        {items.length > 0 && (
          <button
            onClick={onClear}
            className="text-red-500 text-sm font-medium active:scale-95"
            aria-label="Hapus semua pesanan"
          >
            Hapus Semua
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-2">
        {items.length === 0 ? (
          <p className="text-gray-400 text-center mt-8 text-sm">Belum ada pesanan</p>
        ) : (
          items.map((item) => (
            <div key={item.id} className="flex items-center justify-between bg-primary-light rounded-xl px-3 py-2">
              <div className="flex-1 min-w-0">
                <p className="text-navy font-medium text-sm truncate">{item.emoji} {item.name}</p>
                <p className="text-primary text-xs">Rp {(item.price * item.qty).toLocaleString("id-ID")}</p>
              </div>
              <div className="flex items-center gap-2 ml-2">
                <button
                  onClick={() => onDecrease(item.id)}
                  className="w-7 h-7 rounded-full bg-white text-navy font-bold text-lg flex items-center justify-center shadow active:scale-90"
                  aria-label={`Kurangi ${item.name}`}
                >−</button>
                <span className="text-navy font-bold text-sm w-5 text-center">{item.qty}</span>
                <button
                  onClick={() => onIncrease(item.id)}
                  className="w-7 h-7 rounded-full bg-primary text-white font-bold text-lg flex items-center justify-center shadow active:scale-90"
                  aria-label={`Tambah ${item.name}`}
                >+</button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="border-t border-gray-200 px-4 py-3 space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-navy font-bold text-lg">Total</span>
          <span className="text-primary font-bold text-xl">Rp {total.toLocaleString("id-ID")}</span>
        </div>
        <button
          onClick={onCheckout}
          disabled={items.length === 0}
          className="w-full py-3 rounded-xl bg-primary text-white font-bold text-lg
                     disabled:opacity-40 disabled:cursor-not-allowed
                     active:bg-primary-dark transition-colors"
        >
          Bayar
        </button>
      </div>
    </div>
  );
}
