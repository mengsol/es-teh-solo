"use client";

import { useState } from "react";
import { getSupabase } from "../lib/supabase";
import Logo from "./Logo";

export interface User {
  id: number;
  username: string;
  role: "admin" | "kasir";
}

interface LoginProps {
  onLogin: (user: User) => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { data, error: err } = await getSupabase()
      .from("users")
      .select("id, username, role")
      .eq("username", username)
      .eq("password", password)
      .single();

    setLoading(false);

    if (err || !data) {
      setError("Username atau password salah");
      return;
    }

    localStorage.setItem("estehsolo-user", JSON.stringify(data));
    onLogin(data as User);
  };

  return (
    <div className="h-dvh bg-navy flex items-center justify-center p-4">
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl w-full max-w-sm p-8 space-y-6 shadow-2xl">
        <div className="flex flex-col items-center gap-2">
          <Logo size={100} />
          <p className="text-gray-500 text-sm">Point of Sale</p>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-sm text-gray-500 block mb-1">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-navy font-medium
                         focus:border-primary focus:outline-none"
              placeholder="Masukkan username"
              autoComplete="username"
              required
            />
          </div>
          <div>
            <label className="text-sm text-gray-500 block mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-navy font-medium
                         focus:border-primary focus:outline-none"
              placeholder="Masukkan password"
              autoComplete="current-password"
              required
            />
          </div>
        </div>

        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl bg-primary text-white font-bold text-lg
                     disabled:opacity-50 active:bg-primary-dark transition-colors"
        >
          {loading ? "Masuk..." : "Masuk"}
        </button>
      </form>
    </div>
  );
}
