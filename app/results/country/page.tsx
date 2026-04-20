"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import ViewToggle, { ViewType } from "@/components/ViewToggle";
import WorldMapView, { MapPartner } from "@/components/WorldMapView";
import SankeyView from "@/components/SankeyView";
import ProductTable, { TradeProduct } from "@/components/ProductTable";

function CountryResultsContent() {
  const params = useSearchParams();
  const router = useRouter();
  const [view, setView] = useState<ViewType>("map");
  const [products, setProducts] = useState<TradeProduct[]>([]);
  const [loading, setLoading] = useState(false);

  const countryCode = params.get("countryCode") ?? "";
  const countryName = params.get("countryName") ?? countryCode;
  const productsRaw = params.get("products");

  useEffect(() => {
    if (productsRaw) {
      try {
        setProducts(JSON.parse(productsRaw));
      } catch {
        setProducts([]);
      }
      return;
    }
    if (!countryCode) return;
    setLoading(true);
    fetch("/api/search/country", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ countryCode, countryName }),
    })
      .then((r) => r.json())
      .then((data) => setProducts(data.products ?? []))
      .finally(() => setLoading(false));
  }, [countryCode, countryName, productsRaw]);

  function handleProductClick(cmdCode: string, cmdDesc: string) {
    router.push(
      `/?mode=material&material=${encodeURIComponent(cmdDesc)}&hsCode=${encodeURIComponent(cmdCode)}`
    );
  }

  // Build dummy partner for map highlight
  const dummyPartner: MapPartner = {
    partnerCode: countryCode,
    partnerDesc: countryName,
    primaryValue: 1,
    iso3: "",
  };

  const sankeyItems = products.slice(0, 15).map((p) => ({
    name: p.cmdDesc.length > 30 ? p.cmdDesc.slice(0, 30) + "…" : p.cmdDesc,
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
        <span className="text-gray-900">国起点の検索結果</span>
      </div>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {countryName} の対日輸出品目
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              上位{products.length}品目 (2023年)
            </p>
          </div>
          <ViewToggle view={view} onChange={setView} />
        </div>
      </div>

      {/* Visualization */}
      <div className="mb-8">
        {loading ? (
          <div className="flex items-center justify-center h-64 bg-gray-50 rounded-xl border border-gray-200 text-gray-400">
            データ取得中...
          </div>
        ) : view === "map" ? (
          <WorldMapView
            partners={[dummyPartner]}
            highlightCountry={countryCode}
            mode="country"
          />
        ) : (
          <SankeyView
            centerLabel={countryName}
            items={sankeyItems}
            mode="country"
          />
        )}
      </div>

      {/* Table */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">輸出品目ランキング</h2>
        {loading ? (
          <p className="text-gray-400 text-sm">読み込み中...</p>
        ) : (
          <ProductTable products={products} onProductClick={handleProductClick} />
        )}
      </div>
    </div>
  );
}

export default function CountryResultsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-gray-400">読み込み中...</div>}>
      <CountryResultsContent />
    </Suspense>
  );
}
