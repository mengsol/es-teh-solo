"use client";

import { useState, useEffect } from "react";
import { getSupabase } from "../lib/supabase";

export interface SaleRecord {
  id: string;
  order_number: number;
  items: { name: string; qty: number; price: number }[];
  total: number;
  pay_amount: number;
  change: number;
  created_at: string;
}

interface ExpenseRecord {
  id: string;
  item_name: string;
  amount: number;
  created_by: string;
  created_at: string;
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

function toMonthKey(d: string) {
  return new Date(d).toLocaleDateString("id-ID", { month: "long", year: "numeric" });
}

export async function saveSale(sale: Omit<SaleRecord, "created_at">) {
  const { error } = await getSupabase().from("sales").insert(sale);
  if (error) console.error("Gagal simpan:", error.message);
}

export default function SalesReport({ onClose }: SalesReportProps) {
  const [sales, setSales] = useState<SaleRecord[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"harian" | "bulanan" | "pengeluaran">("harian");
  const [expenses, setExpenses] = useState<ExpenseRecord[]>([]);

  useEffect(() => {
    async function fetchSales() {
      const { data, error } = await getSupabase()
        .from("sales")
        .select("*")
        .order("created_at", { ascending: false });
      if (!error && data) setSales(data);
      setLoading(false);
    }
    async function fetchExpenses() {
      const { data, error } = await getSupabase()
        .from("expenses")
        .select("*")
        .order("created_at", { ascending: false });
      if (!error && data) setExpenses(data);
    }
    fetchSales();
    fetchExpenses();
  }, []);

  const dateGroups = sales.reduce<Record<string, SaleRecord[]>>((acc, s) => {
    const key = toDateKey(s.created_at);
    if (!acc[key]) acc[key] = [];
    acc[key].push(s);
    return acc;
  }, {});

  const dates = Object.keys(dateGroups);
  const filtered = selectedDate ? (dateGroups[selectedDate] || []) : sales;

  // Monthly groups
  const monthGroups = sales.reduce<Record<string, SaleRecord[]>>((acc, s) => {
    const key = toMonthKey(s.created_at);
    if (!acc[key]) acc[key] = [];
    acc[key].push(s);
    return acc;
  }, {});
  const months = Object.keys(monthGroups);
  const monthFiltered = selectedMonth ? (monthGroups[selectedMonth] || []) : sales;

  const activeData = tab === "harian" ? filtered : monthFiltered;
  const totalRevenue = activeData.reduce((s, r) => s + r.total, 0);
  const totalTransactions = activeData.length;

  // Filter expenses based on active date/month selection
  const activeExpenses = tab === "harian" && selectedDate
    ? expenses.filter(e => toDateKey(e.created_at) === selectedDate)
    : tab === "bulanan" && selectedMonth
    ? expenses.filter(e => toMonthKey(e.created_at) === selectedMonth)
    : expenses;
  const totalExpense = activeExpenses.reduce((s, e) => s + e.amount, 0);
  const netProfit = totalRevenue - totalExpense;

  const itemCount: Record<string, number> = {};
  activeData.forEach((r) => r.items.forEach((i) => {
    itemCount[i.name] = (itemCount[i.name] || 0) + i.qty;
  }));
  const topItem = Object.entries(itemCount).sort((a, b) => b[1] - a[1])[0];

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[85dvh] flex flex-col shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <h2 className="text-navy font-bold text-lg">📊 Laporan Penjualan</h2>
          <button onClick={onClose} className="text-gray-400 text-2xl leading-none" aria-label="Tutup">×</button>
        </div>

        {/* Tab switcher */}
        <div className="flex px-5 pt-3 gap-2">
          <button
            onClick={() => setTab("harian")}
            className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-colors ${
              tab === "harian" ? "bg-primary text-white" : "bg-gray-100 text-gray-600"
            }`}
          >
            Harian
          </button>
          <button
            onClick={() => setTab("bulanan")}
            className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-colors ${
              tab === "bulanan" ? "bg-primary text-white" : "bg-gray-100 text-gray-600"
            }`}
          >
            Bulanan
          </button>
          <button
            onClick={() => setTab("pengeluaran")}
            className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-colors ${
              tab === "pengeluaran" ? "bg-red-500 text-white" : "bg-gray-100 text-gray-600"
            }`}
          >
            Pengeluaran
          </button>
        </div>

        {tab !== "pengeluaran" && (
        <div className="px-5 py-3 border-b border-gray-100">
          {tab === "harian" ? (
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
          ) : (
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 text-sm text-navy font-medium focus:border-primary focus:outline-none"
            >
              <option value="">Semua Bulan</option>
              {months.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          )}
        </div>
        )}

        {tab !== "pengeluaran" && (
        <div className="grid grid-cols-2 gap-3 px-5 py-3">
          <div className="bg-primary-light rounded-xl p-3 text-center">
            <p className="text-xs text-gray-500">Pendapatan</p>
            <p className="text-primary font-bold text-sm">{formatRp(totalRevenue)}</p>
          </div>
          <div className="bg-red-50 rounded-xl p-3 text-center">
            <p className="text-xs text-gray-500">Pengeluaran</p>
            <p className="text-red-500 font-bold text-sm">{formatRp(totalExpense)}</p>
          </div>
          <div className={`rounded-xl p-3 text-center ${netProfit >= 0 ? "bg-primary-light" : "bg-red-50"}`}>
            <p className="text-xs text-gray-500">Laba Bersih</p>
            <p className={`font-bold text-sm ${netProfit >= 0 ? "text-primary" : "text-red-500"}`}>{formatRp(netProfit)}</p>
          </div>
          <div className="bg-gray-100 rounded-xl p-3 text-center">
            <p className="text-xs text-gray-500">Transaksi</p>
            <p className="text-navy font-bold text-sm">{totalTransactions}</p>
          </div>
        </div>
        )}

        <div className="flex-1 overflow-y-auto px-5 py-2 space-y-2">
          {loading ? (
            <p className="text-gray-400 text-center mt-8 text-sm">Memuat data...</p>
          ) : tab === "pengeluaran" ? (
            <>
              {/* Expense summary */}
              <div className="grid grid-cols-2 gap-3 pb-2">
                <div className="bg-red-50 rounded-xl p-3 text-center">
                  <p className="text-xs text-gray-500">Total Pengeluaran</p>
                  <p className="text-red-500 font-bold text-sm">{formatRp(expenses.reduce((s, e) => s + e.amount, 0))}</p>
                </div>
                <div className="bg-red-50 rounded-xl p-3 text-center">
                  <p className="text-xs text-gray-500">Jumlah Item</p>
                  <p className="text-red-500 font-bold text-sm">{expenses.length}</p>
                </div>
              </div>
              {expenses.length === 0 ? (
                <p className="text-gray-400 text-center mt-4 text-sm">Belum ada pengeluaran</p>
              ) : (
                expenses.map((exp) => (
                  <div key={exp.id} className="flex items-center justify-between border border-gray-200 rounded-xl px-4 py-3">
                    <div>
                      <p className="text-navy font-medium text-sm">{exp.item_name}</p>
                      <p className="text-gray-400 text-xs">
                        {new Date(exp.created_at).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}
                        {" · "}
                        {new Date(exp.created_at).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                        {" · "}{exp.created_by}
                      </p>
                    </div>
                    <p className="text-red-500 font-bold text-sm">-{formatRp(exp.amount)}</p>
                  </div>
                ))
              )}
            </>
          ) : activeData.length === 0 ? (
            <p className="text-gray-400 text-center mt-8 text-sm">Belum ada transaksi</p>
          ) : tab === "bulanan" ? (
            <>
              {/* Item breakdown per bulan */}
              <div className="space-y-2">
                <p className="text-navy font-semibold text-sm">Rincian per Item</p>
                {Object.entries(itemCount).sort((a, b) => b[1] - a[1]).map(([name, qty]) => {
                  const itemTotal = activeData.reduce((sum, r) =>
                    sum + r.items.filter(i => i.name === name).reduce((s, i) => s + i.price * i.qty, 0), 0);
                  return (
                    <div key={name} className="flex items-center justify-between bg-primary-light rounded-xl px-4 py-3">
                      <div>
                        <p className="text-navy font-medium text-sm">{name}</p>
                        <p className="text-gray-500 text-xs">Terjual: {qty} cup</p>
                      </div>
                      <p className="text-primary font-bold text-sm">{formatRp(itemTotal)}</p>
                    </div>
                  );
                })}
              </div>

              {/* Daily breakdown in month */}
              <div className="space-y-2 pt-2">
                <p className="text-navy font-semibold text-sm">Per Hari</p>
                {Object.entries(
                  activeData.reduce<Record<string, { count: number; total: number }>>((acc, s) => {
                    const day = toDateKey(s.created_at);
                    if (!acc[day]) acc[day] = { count: 0, total: 0 };
                    acc[day].count++;
                    acc[day].total += s.total;
                    return acc;
                  }, {})
                ).map(([day, info]) => (
                  <div key={day} className="flex items-center justify-between border border-gray-200 rounded-xl px-4 py-3">
                    <div>
                      <p className="text-navy font-medium text-sm">{day}</p>
                      <p className="text-gray-400 text-xs">{info.count} transaksi</p>
                    </div>
                    <p className="text-primary font-bold text-sm">{formatRp(info.total)}</p>
                  </div>
                ))}
              </div>
            </>
          ) : (
            filtered.map((sale) => (
              <div key={sale.id} className="border border-gray-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => setExpandedId(expandedId === sale.id ? null : sale.id)}
                  className="w-full flex items-center justify-between px-4 py-3 text-left active:bg-gray-50"
                >
                  <div>
                    <p className="text-navy font-medium text-sm">Order #{String(sale.order_number).padStart(4, "0")}</p>
                    <p className="text-gray-400 text-xs">
                      {new Date(sale.created_at).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
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
                      <span>Bayar: {formatRp(sale.pay_amount)}</span>
                      <span>Kembali: {formatRp(sale.change)}</span>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

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
