"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Mode = "material" | "country";

const INDUSTRY_OPTIONS = [
  "塗装業",
  "建設業",
  "製造業",
  "食品業",
  "農業",
  "化学工業",
  "電子機器製造",
  "自動車製造",
  "繊維業",
  "その他",
];

export default function SearchForm() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("material");
  const [industry, setIndustry] = useState("");
  const [material, setMaterial] = useState("");
  const [country, setCountry] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (mode === "material") {
        const res = await fetch("/api/search/material", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ industry, material }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        const params = new URLSearchParams({
          id: data.id,
          industry,
          material,
          hsCode: data.hsCode,
          hsDesc: data.hsDesc,
          partners: JSON.stringify(data.partners),
        });
        router.push(`/results/material?${params}`);
      } else {
        const res = await fetch("/api/search/country", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ countryCode: country, countryName: country }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        const params = new URLSearchParams({
          id: data.id,
          countryCode: data.countryCode,
          countryName: data.countryName,
          products: JSON.stringify(data.products),
        });
        router.push(`/results/country?${params}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Mode toggle */}
      <div className="flex rounded-lg overflow-hidden border border-gray-200">
        <button
          type="button"
          onClick={() => setMode("material")}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            mode === "material"
              ? "bg-blue-600 text-white"
              : "bg-white text-gray-600 hover:bg-gray-50"
          }`}
        >
          材料から調べる
        </button>
        <button
          type="button"
          onClick={() => setMode("country")}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            mode === "country"
              ? "bg-blue-600 text-white"
              : "bg-white text-gray-600 hover:bg-gray-50"
          }`}
        >
          国から調べる
        </button>
      </div>

      {mode === "material" ? (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">業種</label>
            <select
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">選択してください</option>
              {INDUSTRY_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">原材料名</label>
            <input
              type="text"
              value={material}
              onChange={(e) => setMaterial(e.target.value)}
              placeholder="例: シンナー、鉄鋼、大豆"
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </>
      ) : (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">国名または国コード</label>
          <input
            type="text"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            placeholder="例: 中国、米国、156"
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="mt-1 text-xs text-gray-500">国連Comtrade の国コード（数字）も使用できます</p>
        </div>
      )}

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? "検索中..." : "検索する"}
      </button>
    </form>
  );
}
