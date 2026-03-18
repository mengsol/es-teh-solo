"use client";

import { useState, useCallback } from "react";
import Logo from "./components/Logo";
import MenuCard, { type MenuItem } from "./components/MenuCard";
import Cart, { type CartItem } from "./components/Cart";
import Receipt from "./components/Receipt";

const MENU: MenuItem[] = [
  // Original
  { id: "et-original", name: "Es Teh Original", price: 5000, emoji: "🍵", category: "original" },
  { id: "et-manis", name: "Es Teh Manis", price: 5000, emoji: "🧊", category: "original" },
  { id: "teh-hangat", name: "Teh Hangat", price: 4000, emoji: "☕", category: "original" },
  { id: "et-tawar", name: "Es Teh Tawar", price: 4000, emoji: "🫖", category: "original" },
  // Rasa
  { id: "et-lemon", name: "Es Teh Lemon", price: 7000, emoji: "🍋", category: "rasa" },
  { id: "et-lychee", name: "Es Teh Lychee", price: 8000, emoji: "🫧", category: "rasa" },
  { id: "et-mango", name: "Es Teh Mango", price: 8000, emoji: "🥭", category: "rasa" },
  { id: "et-peach", name: "Es Teh Peach", price: 8000, emoji: "🍑", category: "rasa" },
  { id: "et-strawberry", name: "Es Teh Strawberry", price: 8000, emoji: "🍓", category: "rasa" },
  { id: "et-coklat", name: "Es Teh Coklat", price: 8000, emoji: "🍫", category: "rasa" },
  // Topping
  { id: "tp-boba", name: "+ Boba", price: 3000, emoji: "⚫", category: "topping" },
  { id: "tp-jelly", name: "+ Jelly Nata", price: 2000, emoji: "🟡", category: "topping" },
  { id: "tp-pudding", name: "+ Pudding", price: 3000, emoji: "🍮", category: "topping" },
];

const CATEGORIES = [
  { key: "all", label: "Semua" },
  { key: "original", label: "Original" },
  { key: "rasa", label: "Rasa" },
  { key: "topping", label: "Topping" },
] as const;

const QUICK_CASH = [10000, 20000, 50000, 100000];

export default function POSPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [category, setCategory] = useState<string>("all");
  const [showPayment, setShowPayment] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [payAmount, setPayAmount] = useState(0);
  const [customPay, setCustomPay] = useState("");
  const [orderNum, setOrderNum] = useState(1);

  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);

  const filtered = category === "all" ? MENU : MENU.filter((m) => m.category === category);

  const addToCart = useCallback((item: MenuItem) => {
    setCart((prev) => {
      const exists = prev.find((c) => c.id === item.id);
      if (exists) return prev.map((c) => (c.id === item.id ? { ...c, qty: c.qty + 1 } : c));
      return [...prev, { ...item, qty: 1 }];
    });
  }, []);

  const increase = useCallback((id: string) => {
    setCart((prev) => prev.map((c) => (c.id === id ? { ...c, qty: c.qty + 1 } : c)));
  }, []);

  const decrease = useCallback((id: string) => {
    setCart((prev) => prev.map((c) => (c.id === id ? { ...c, qty: c.qty - 1 } : c)).filter((c) => c.qty > 0));
  }, []);

  const handleCheckout = () => {
    setPayAmount(0);
    setCustomPay("");
    setShowPayment(true);
  };

  const confirmPay = () => {
    const amount = customPay ? parseInt(customPay) : payAmount;
    if (amount >= total) {
      setPayAmount(amount);
      setShowPayment(false);
      setShowReceipt(true);
    }
  };

  const finishOrder = () => {
    setShowReceipt(false);
    setCart([]);
    setOrderNum((n) => n + 1);
  };

  return (
    <div className="h-dvh flex flex-col">
      {/* Header */}
      <header className="bg-navy text-white flex items-center gap-3 px-4 py-2 shadow-lg">
        <Logo size={48} />
        <div>
          <h1 className="font-bold text-lg leading-tight">Es Teh Solo</h1>
          <p className="text-green-300 text-xs">Point of Sale</p>
        </div>
        <div className="ml-auto text-right">
          <p className="text-xs text-gray-300">
            {new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </p>
          <p className="text-xs text-green-300">Order #{String(orderNum).padStart(4, "0")}</p>
        </div>
      </header>

      {/* Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Menu area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Category tabs */}
          <div className="flex gap-2 px-4 py-3 bg-white border-b border-gray-200">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setCategory(cat.key)}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors
                  ${category === cat.key
                    ? "bg-primary text-white shadow"
                    : "bg-gray-100 text-gray-600 active:bg-gray-200"
                  }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Menu grid */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="grid grid-cols-3 lg:grid-cols-4 gap-3">
              {filtered.map((item) => (
                <MenuCard key={item.id} item={item} onAdd={addToCart} />
              ))}
            </div>
          </div>
        </div>

        {/* Cart sidebar */}
        <aside className="w-80 bg-white border-l border-gray-200 flex flex-col">
          <Cart
            items={cart}
            onIncrease={increase}
            onDecrease={decrease}
            onClear={() => setCart([])}
            onCheckout={handleCheckout}
          />
        </aside>
      </div>

      {/* Payment modal */}
      {showPayment && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <h2 className="text-navy font-bold text-xl text-center">Pembayaran</h2>
            <div className="text-center">
              <p className="text-gray-500 text-sm">Total</p>
              <p className="text-primary font-bold text-3xl">Rp {total.toLocaleString("id-ID")}</p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {QUICK_CASH.map((amount) => (
                <button
                  key={amount}
                  onClick={() => { setPayAmount(amount); setCustomPay(""); }}
                  className={`py-3 rounded-xl font-bold text-sm transition-colors
                    ${payAmount === amount && !customPay
                      ? "bg-primary text-white"
                      : "bg-gray-100 text-navy active:bg-gray-200"
                    }`}
                >
                  Rp {amount.toLocaleString("id-ID")}
                </button>
              ))}
            </div>

            <div>
              <label className="text-sm text-gray-500 block mb-1">Jumlah lain</label>
              <input
                type="number"
                inputMode="numeric"
                value={customPay}
                onChange={(e) => { setCustomPay(e.target.value); setPayAmount(0); }}
                placeholder="Masukkan nominal..."
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-lg font-bold text-navy
                           focus:border-primary focus:outline-none"
              />
            </div>

            {((customPay ? parseInt(customPay) : payAmount) > 0) && (
              <div className="text-center">
                <p className="text-sm text-gray-500">Kembalian</p>
                <p className={`font-bold text-xl ${
                  (customPay ? parseInt(customPay) : payAmount) >= total ? "text-primary" : "text-red-500"
                }`}>
                  Rp {((customPay ? parseInt(customPay) : payAmount) - total).toLocaleString("id-ID")}
                </p>
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={() => setShowPayment(false)}
                className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-gray-600 font-bold active:bg-gray-50"
              >
                Batal
              </button>
              <button
                onClick={confirmPay}
                disabled={(customPay ? parseInt(customPay) : payAmount) < total}
                className="flex-1 py-3 rounded-xl bg-primary text-white font-bold
                           disabled:opacity-40 disabled:cursor-not-allowed active:bg-primary-dark"
              >
                Konfirmasi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Receipt modal */}
      {showReceipt && (
        <Receipt items={cart} payAmount={payAmount || parseInt(customPay)} onClose={finishOrder} orderNumber={orderNum} />
      )}
    </div>
  );
}
