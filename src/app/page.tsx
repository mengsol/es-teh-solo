"use client";

import { useState, useCallback, useEffect } from "react";
import Logo from "./components/Logo";
import MenuCard, { type MenuItem } from "./components/MenuCard";
import Cart, { type CartItem } from "./components/Cart";
import Receipt from "./components/Receipt";
import SalesReport, { saveSale } from "./components/SalesReport";
import Login, { type User } from "./components/Login";
import Expense from "./components/Expense";

const MENU: MenuItem[] = [
  { id: "etm-besar", name: "Es Teh Manis Besar", price: 5000, image: "/teh-besar.png", category: "original" },
  { id: "etm-kecil", name: "Es Teh Manis Kecil", price: 3000, image: "/teh-kecil.png", category: "original" },
];

const QUICK_CASH = [10000, 20000, 50000, 100000];

export default function POSPage() {
  const [user, setUser] = useState<User | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showPayment, setShowPayment] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [payAmount, setPayAmount] = useState(0);
  const [customPay, setCustomPay] = useState("");
  const [orderNum, setOrderNum] = useState(1);
  const [showCart, setShowCart] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [showExpense, setShowExpense] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("estehsolo-user");
      if (saved) setUser(JSON.parse(saved));
    } catch { /* ignore */ }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("estehsolo-user");
    setUser(null);
    setCart([]);
  };

  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

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
    const amount = payAmount || parseInt(customPay);
    saveSale({
      id: `${Date.now()}-${orderNum}`,
      order_number: orderNum,
      items: cart.map((c) => ({ name: c.name, qty: c.qty, price: c.price })),
      total,
      pay_amount: amount,
      change: amount - total,
    });
    setShowReceipt(false);
    setCart([]);
    setOrderNum((n) => n + 1);
  };

  if (!user) return <Login onLogin={setUser} />;

  return (
    <div className="h-dvh flex flex-col">
      {/* Header */}
      <header className="bg-navy text-white shadow-lg">
        {/* Baris atas: Logo + Nama + User + Keluar */}
        <div className="flex items-center gap-2 px-3 py-2 sm:px-4">
          <Logo size={36} />
          <div className="min-w-0">
            <h1 className="font-bold text-sm sm:text-lg leading-tight truncate">Es Teh Solo</h1>
            <p className="text-green-300 text-[10px] sm:text-xs">Point of Sale</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <div className="text-right hidden sm:block">
              <p className="text-xs text-gray-300">
                👤 {user.username} ({user.role})
              </p>
              <p className="text-xs text-green-300">Order #{String(orderNum).padStart(4, "0")}</p>
            </div>
            <p className="text-[10px] text-gray-300 sm:hidden">👤 {user.username}</p>
            <button
              onClick={handleLogout}
              className="bg-red-500/20 text-red-300 px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg text-[10px] sm:text-xs font-medium active:scale-95 transition-transform"
            >
              Keluar
            </button>
          </div>
        </div>
        {/* Baris bawah: Tombol aksi + Order number */}
        <div className="flex items-center gap-2 px-3 pb-2 sm:px-4">
          {user.role === "admin" && (
            <button
              onClick={() => setShowReport(true)}
              className="bg-navy-light px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg text-[10px] sm:text-xs font-medium active:scale-95 transition-transform"
            >
              📊 Laporan
            </button>
          )}
          <button
            onClick={() => setShowExpense(true)}
            className="bg-navy-light px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg text-[10px] sm:text-xs font-medium active:scale-95 transition-transform"
          >
            🛒 Pengeluaran
          </button>
          <p className="ml-auto text-[10px] sm:text-xs text-green-300 sm:hidden">Order #{String(orderNum).padStart(4, "0")}</p>
        </div>
      </header>

      {/* Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Menu area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Menu grid */}
          <div className="flex-1 overflow-y-auto p-4 pb-20 lg:pb-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {MENU.map((item) => (
                <MenuCard key={item.id} item={item} onAdd={addToCart} />
              ))}
            </div>
          </div>
        </div>

        {/* Cart sidebar - desktop/landscape */}
        <aside className="hidden lg:flex w-80 bg-white border-l border-gray-200 flex-col">
          <Cart
            items={cart}
            onIncrease={increase}
            onDecrease={decrease}
            onClear={() => setCart([])}
            onCheckout={handleCheckout}
          />
        </aside>
      </div>

      {/* Floating cart button - tablet/mobile only */}
      {!showCart && (
        <button
          onClick={() => setShowCart(true)}
          className="lg:hidden fixed bottom-4 right-4 z-40 bg-primary text-white rounded-full w-16 h-16
                     flex items-center justify-center shadow-lg active:scale-95 transition-transform"
          aria-label="Buka keranjang"
        >
          <span className="text-2xl">🛒</span>
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
              {cartCount}
            </span>
          )}
        </button>
      )}

      {/* Cart slide-up panel - tablet/mobile only */}
      {showCart && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowCart(false)} />
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl max-h-[75dvh] flex flex-col shadow-2xl">
            <div className="flex justify-center pt-2 pb-1">
              <button
                onClick={() => setShowCart(false)}
                className="w-12 h-1.5 bg-gray-300 rounded-full"
                aria-label="Tutup keranjang"
              />
            </div>
            <Cart
              items={cart}
              onIncrease={increase}
              onDecrease={decrease}
              onClear={() => setCart([])}
              onCheckout={() => { setShowCart(false); handleCheckout(); }}
            />
          </div>
        </div>
      )}

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

      {/* Sales Report modal */}
      {showReport && <SalesReport onClose={() => setShowReport(false)} />}

      {/* Expense modal */}
      {showExpense && <Expense onClose={() => setShowExpense(false)} username={user.username} />}
    </div>
  );
}
