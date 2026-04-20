"use client";

import { useEffect, useState } from "react";
import SearchForm from "@/components/SearchForm";

interface HistoryItem {
  id: string;
  mode: string;
  industry: string;
  material: string;
  country: string;
  hsCode: string;
  createdAt: string;
}

export default function HomePage() {
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    fetch("/api/history")
      .then((r) => r.json())
      .then((data) => setHistory(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  async function deleteHistory(id: string) {
    await fetch(`/api/history?id=${id}`, { method: "DELETE" });
    setHistory((prev) => prev.filter((h) => h.id !== id));
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-2xl mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">AltMate</h1>
          <p className="text-gray-500 text-lg">原材料の産地・ルートを可視化する</p>
        </div>

        {/* Search Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
          <SearchForm />
        </div>

        {/* How to use */}
        <div className="grid grid-cols-2 gap-4 mb-10">
          <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
            <div className="text-blue-600 font-semibold text-sm mb-1">材料から調べる</div>
            <p className="text-xs text-blue-500">
              業種と材料名を入力すると、日本への主要輸出国を地図とサンキー図で表示します
            </p>
            <p className="text-xs text-blue-400 mt-2">例: 塗装業 / シンナー</p>
          </div>
          <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-100">
            <div className="text-indigo-600 font-semibold text-sm mb-1">国から調べる</div>
            <p className="text-xs text-indigo-500">
              国名を入力すると、その国が日本に輸出している品目ランキングを表示します
            </p>
            <p className="text-xs text-indigo-400 mt-2">例: 中国、米国、156</p>
          </div>
        </div>

        {/* Search History */}
        {history.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold text-gray-500 mb-3 uppercase tracking-wide">
              検索履歴
            </h2>
            <div className="space-y-2">
              {history.map((h) => (
                <div
                  key={h.id}
                  className="flex items-center justify-between bg-white rounded-xl border border-gray-100 px-4 py-3 shadow-sm"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        h.mode === "material"
                          ? "bg-blue-100 text-blue-600"
                          : "bg-indigo-100 text-indigo-600"
                      }`}
                    >
                      {h.mode === "material" ? "材料" : "国"}
                    </span>
                    <span className="text-sm text-gray-700 truncate">
                      {h.mode === "material"
                        ? `${h.industry} / ${h.material}`
                        : h.country}
                    </span>
                    {h.hsCode && (
                      <span className="text-xs text-gray-400 font-mono hidden sm:inline">
                        {h.hsCode}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 ml-2 shrink-0">
                    <span className="text-xs text-gray-400">
                      {new Date(h.createdAt).toLocaleDateString("ja-JP")}
                    </span>
                    <button
                      onClick={() => deleteHistory(h.id)}
                      className="text-gray-300 hover:text-red-400 transition-colors text-lg leading-none"
                      title="削除"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
