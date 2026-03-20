"use client";

import { useState } from "react";
import { getSupabase } from "../lib/supabase";

interface ExpenseProps {
  onClose: () => void;
  username: string;
}

export default function Expense({ onClose, username }: ExpenseProps) {
  const [itemName, setItemName] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName.trim() || !amount) return;

    setLoading(true);
    setError("");

    const { error: err } = await getSupabase().from("expenses").insert({
      id: `exp-${Date.now()}`,
      item_name: itemName.trim(),
      amount: parseInt(amount),
      created_by: username,
    });

    setLoading(false);

    if (err) {
      setError("Gagal menyimpan: " + err.message);
      return;
    }

    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      setItemName("");
      setAmount("");
    }, 1500);
  };

  const formatDisplay = (val: string) => {
    if (!val) return "";
    return parseInt(val).toLocaleString("id-ID");
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <h2 className="text-navy font-bold text-lg">🛒 Catat Pengeluaran</h2>
          <button onClick={onClose} className="text-gray-400 text-2xl leading-none" aria-label="Tutup">×</button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="text-sm text-gray-500 block mb-1">Nama Barang</label>
            <input
              type="text"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              placeholder="Contoh: Gula pasir, Teh, Es batu..."
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-navy font-medium
                         focus:border-primary focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="text-sm text-gray-500 block mb-1">Harga (Rp)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">Rp</span>
              <input
                type="number"
                inputMode="numeric"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                min="1"
                className="w-full border-2 border-gray-200 rounded-xl pl-12 pr-4 py-3 text-navy font-bold text-lg
                           focus:border-primary focus:outline-none"
                required
              />
            </div>
            {amount && (
              <p className="text-xs text-gray-400 mt-1">Rp {formatDisplay(amount)}</p>
            )}
          </div>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          {success && <p className="text-primary text-sm text-center font-medium">✅ Berhasil disimpan!</p>}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-gray-600 font-bold active:bg-gray-50"
            >
              Tutup
            </button>
            <button
              type="submit"
              disabled={loading || !itemName.trim() || !amount}
              className="flex-1 py-3 rounded-xl bg-primary text-white font-bold
                         disabled:opacity-40 disabled:cursor-not-allowed active:bg-primary-dark transition-colors"
            >
              {loading ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
