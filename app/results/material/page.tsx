"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, Suspense } from "react";
import ViewToggle, { ViewType } from "@/components/ViewToggle";
import WorldMapView, { MapPartner } from "@/components/WorldMapView";
import SankeyView from "@/components/SankeyView";
import CountryTable from "@/components/CountryTable";

function MaterialResultsContent() {
  const params = useSearchParams();
  const router = useRouter();
  const [view, setView] = useState<ViewType>("map");

  const industry = params.get("industry") ?? "";
  const material = params.get("material") ?? "";
  const hsCode = params.get("hsCode") ?? "";
  const hsDesc = params.get("hsDesc") ?? "";
  const partnersRaw = params.get("partners") ?? "[]";

  let partners: MapPartner[] = [];
  try {
    partners = JSON.parse(partnersRaw);
  } catch {
    partners = [];
  }

  async function handleCountryClickWithFetch(countryCode: string, countryName: string) {
    const res = await fetch("/api/search/country", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ countryCode, countryName }),
    });
    const data = await res.json();
    if (res.ok) {
      const searchParams = new URLSearchParams({
        id: data.id,
        countryCode: data.countryCode,
        countryName: data.countryName,
        products: JSON.stringify(data.products),
      });
      router.push(`/results/country?${searchParams}`);
    }
  }

  const sankeyItems = partners.map((p) => ({
    name: p.partnerDesc,
    value: p.primaryValue,
  }));

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <button onClick={() => router.push("/")} className="hover:text-blue-600 hover:underline">
          ホーム
        </button>
        <span>/</span>
        <span className="text-gray-900">材料起点の検索結果</span>
      </div>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {industry} / {material}
            </h1>
            <p className="text-gray-500 mt-1">
              HSコード: <span className="font-mono font-medium text-gray-700">{hsCode}</span>
              {hsDesc && <span className="ml-2 text-gray-400">({hsDesc})</span>}
            </p>
            <p className="text-sm text-gray-400 mt-1">
              日本への輸出国 上位{partners.length}カ国 (2023年)
            </p>
          </div>
          <ViewToggle view={view} onChange={setView} />
        </div>
      </div>

      {/* Visualization */}
      <div className="mb-8">
        {view === "map" ? (
          <WorldMapView
            partners={partners}
            mode="material"
            onCountryClick={handleCountryClickWithFetch}
          />
        ) : (
          <SankeyView
            centerLabel={material}
            items={sankeyItems}
            mode="material"
          />
        )}
      </div>

      {/* Table */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">輸出国ランキング</h2>
        <CountryTable partners={partners} onCountryClick={handleCountryClickWithFetch} />
      </div>
    </div>
  );
}

export default function MaterialResultsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-gray-400">読み込み中...</div>}>
      <MaterialResultsContent />
    </Suspense>
  );
}
