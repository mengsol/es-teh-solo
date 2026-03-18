"use client";

import { useState, useEffect } from "react";

export interface SaleRecord {
  id: string;
  orderNumber: number;
  items: { name: string; qty: number; price: number }[];
  total: number;
  payAmount: number;
  change: number;
  date: string; // ISO string
}

interface SalesReportProps {
  onClose: () => void;
}

function formatRp(n: number) {
  return `Rp ${n.toLocaleString("id-ID")}`;
}

function toDateKey(d: string) {
  return new Date(d).toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" });
}

export function saveSale(sale: SaleRecord) {
  const sales = getSales();
  sales.push(sale);
  localStorage.setItem("estehsolo-sales", JSON.stringify(sales));
}

export function getSales(): SaleRecord[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem("estehsolo-sales") || "[]");
  } catch {
    return [];
  }
}

export default function SalesReport({ onClose }: SalesReportProps) {
  const [sales, setSales] = useState<SaleRecord[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    const all = getSales();
    setSales(all);
    if (all.length > 0) {
      setSelectedDate(toDateKey(all[all.length - 1].date));
    }
  }, []);

  // Group by date
  const dateGroups = sales.reduce<Record<string, SaleRecord[]>>((acc, s) => {
    const key = toDateKey(s.date);
    if (!acc[key]) acc[key] = [];
    acc[key].push(s);
    return acc;
  }, {});

  const dates = Object.keys(dateGroups);
  const filtered = selectedDate ? (dateGroups[selectedDate] || []) : sales;
  const totalRevenue = filtered.reduce((s, r) => s + r.total, 0);
  const totalTransactions = filtered.length;

  // Item terlaris
  const itemCount: Record<string, number> = {};
  filtered.forEach((r) => r.items.forEach((i) => {
    itemCount[i.name] = (itemCount[i.name] || 0) + i.qty;
  }));
  const topItem = Object.entries(itemCount).sort((a, b) => b[1] - a[1])[0];

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[85dvh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <h2 className="text-navy font-bold text-lg">📊 Laporan Penjualan</h2>
          <button onClick={onClose} className="text-gray-400 text-2xl leading-none" aria-label="Tutup">×</button>
        </div>

        {/* Date filter */}
        <div className="px-5 py-3 border-b border-gray-100">
          <select
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 text-sm text-navy font-medium focus:border-primary focus:outline-none"
          >
            <option value="">Semua Tanggal</option>
            {dates.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-3 px-5 py-3">
          <div className="bg-primary-light rounded-xl p-3 text-center">
            <p className="text-xs text-gray-500">Pendapatan</p>
            <p className="text-primary font-bold text-sm">{formatRp(totalRevenue)}</p>
          </div>
          <div className="bg-primary-light rounded-xl p-3 text-center">
            <p className="text-xs text-gray-500">Transaksi</p>
            <p className="text-primary font-bold text-sm">{totalTransactions}</p>
          </div>
          <div className="bg-primary-light rounded-xl p-3 text-center">
            <p className="text-xs text-gray-500">Terlaris</p>
            <p className="text-primary font-bold text-sm truncate">{topItem ? `${topItem[0]} (${topItem[1]})` : "-"}</p>
          </div>
        </div>

        {/* Transaction list */}
        <div className="flex-1 overflow-y-auto px-5 py-2 space-y-2">
          {filtered.length === 0 ? (
            <p className="text-gray-400 text-center mt-8 text-sm">Belum ada transaksi</p>
          ) : (
            filtered.slice().reverse().map((sale) => (
              <div key={sale.id} className="border border-gray-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => setExpandedId(expandedId === sale.id ? null : sale.id)}
                  className="w-full flex items-center justify-between px-4 py-3 text-left active:bg-gray-50"
                >
                  <div>
                    <p className="text-navy font-medium text-sm">Order #{String(sale.orderNumber).padStart(4, "0")}</p>
                    <p className="text-gray-400 text-xs">
                      {new Date(sale.date).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                  <p className="text-primary font-bold text-sm">{formatRp(sale.total)}</p>
                </button>
                {expandedId === sale.id && (
                  <div className="px-4 pb-3 border-t border-gray-100 space-y-1 pt-2">
                    {sale.items.map((item, i) => (
                      <div key={i} className="flex justify-between text-xs text-gray-600">
                        <span>{item.name} x{item.qty}</span>
                        <span>{formatRp(item.price * item.qty)}</span>
                      </div>
                    ))}
                    <div className="flex justify-between text-xs text-gray-400 pt-1 border-t border-dashed border-gray-200">
                      <span>Bayar: {formatRp(sale.payAmount)}</span>
                      <span>Kembali: {formatRp(sale.change)}</span>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-primary text-white font-bold active:bg-primary-dark transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
