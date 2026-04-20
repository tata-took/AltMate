"use client";

import { useState } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  Line,
  Marker,
} from "react-simple-maps";

const GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

const JAPAN_COORDS: [number, number] = [138.5, 36.5];

export interface MapPartner {
  partnerCode: string;
  partnerDesc: string;
  primaryValue: number;
  iso3: string;
  lat?: number;
  lng?: number;
}

interface WorldMapViewProps {
  partners: MapPartner[];
  highlightCountry?: string;
  onCountryClick?: (countryCode: string, countryName: string) => void;
  mode: "material" | "country";
}

// Approximate coordinates for top trading partners
const COUNTRY_COORDS: Record<string, [number, number]> = {
  CHN: [104.2, 35.9],
  USA: [-95.7, 37.1],
  AUS: [133.8, -25.3],
  KOR: [127.8, 36.5],
  SAU: [45.1, 23.9],
  ARE: [53.8, 23.4],
  CAN: [-96.8, 56.1],
  BRA: [-51.9, -14.2],
  RUS: [105.3, 61.5],
  DEU: [10.5, 51.2],
  GBR: [-3.4, 55.4],
  FRA: [2.2, 46.2],
  ITA: [12.6, 42.5],
  IDN: [113.9, -0.8],
  MYS: [109.7, 4.2],
  THA: [100.5, 15.9],
  VNM: [108.3, 14.1],
  IND: [78.9, 20.6],
  ZAF: [25.1, -29.0],
  MEX: [-102.6, 23.6],
  PHL: [122.9, 12.9],
  TWN: [120.9, 23.7],
  NLD: [5.3, 52.1],
  SGP: [103.8, 1.4],
  NZL: [174.9, -40.9],
};

function getCoords(iso3: string): [number, number] | null {
  return COUNTRY_COORDS[iso3] ?? null;
}

export default function WorldMapView({
  partners,
  highlightCountry,
  onCountryClick,
  mode,
}: WorldMapViewProps) {
  const [tooltip, setTooltip] = useState<{ name: string; value: string } | null>(null);

  const maxValue = Math.max(...partners.map((p) => p.primaryValue), 1);

  const partnersWithCoords = partners
    .map((p) => ({ ...p, coords: getCoords(p.iso3) }))
    .filter((p) => p.coords !== null);

  return (
    <div className="relative bg-gray-50 rounded-xl overflow-hidden border border-gray-200">
      {tooltip && (
        <div className="absolute top-3 left-3 bg-white border border-gray-200 rounded-lg px-3 py-2 shadow text-sm z-10 pointer-events-none">
          <p className="font-medium">{tooltip.name}</p>
          <p className="text-gray-500">{tooltip.value}</p>
        </div>
      )}
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{ scale: 130, center: [20, 20] }}
        style={{ width: "100%", height: "auto" }}
      >
        <Geographies geography={GEO_URL}>
          {({ geographies }) =>
            geographies.map((geo) => {
              const iso3 = geo.properties.ADM0_A3 ?? geo.id;
              const isPartner = partners.some((p) => p.iso3 === iso3);
              const isHighlight = highlightCountry === iso3;
              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  onClick={() => {
                    if (onCountryClick && isPartner) {
                      const partner = partners.find((p) => p.iso3 === iso3);
                      if (partner) onCountryClick(partner.partnerCode, partner.partnerDesc);
                    }
                  }}
                  style={{
                    default: {
                      fill: isHighlight ? "#4f46e5" : isPartner ? "#93c5fd" : "#e5e7eb",
                      stroke: "#fff",
                      strokeWidth: 0.5,
                      outline: "none",
                    },
                    hover: {
                      fill: isPartner ? "#3b82f6" : "#d1d5db",
                      stroke: "#fff",
                      strokeWidth: 0.5,
                      outline: "none",
                      cursor: isPartner ? "pointer" : "default",
                    },
                    pressed: { fill: "#2563eb", outline: "none" },
                  }}
                />
              );
            })
          }
        </Geographies>

        {/* Arc lines from partner countries to Japan */}
        {mode === "material" &&
          partnersWithCoords.map((partner) => {
            const opacity = 0.3 + 0.7 * (partner.primaryValue / maxValue);
            const strokeWidth = 0.5 + 3 * (partner.primaryValue / maxValue);
            return (
              <Line
                key={partner.partnerCode}
                from={partner.coords!}
                to={JAPAN_COORDS}
                stroke="#3b82f6"
                strokeWidth={strokeWidth}
                strokeOpacity={opacity}
                strokeLinecap="round"
              />
            );
          })}

        {/* Japan marker */}
        <Marker coordinates={JAPAN_COORDS}>
          <circle r={6} fill="#ef4444" stroke="#fff" strokeWidth={2} />
          <text
            textAnchor="middle"
            y={-10}
            style={{ fontSize: 10, fontWeight: "bold", fill: "#1f2937" }}
          >
            日本
          </text>
        </Marker>

        {/* Partner country markers */}
        {partnersWithCoords.slice(0, 10).map((partner) => (
          <Marker
            key={partner.partnerCode}
            coordinates={partner.coords!}
            onMouseEnter={() =>
              setTooltip({
                name: partner.partnerDesc,
                value: `$${(partner.primaryValue / 1e6).toFixed(1)}M`,
              })
            }
            onMouseLeave={() => setTooltip(null)}
            onClick={() =>
              onCountryClick && onCountryClick(partner.partnerCode, partner.partnerDesc)
            }
          >
            <circle
              r={4}
              fill="#3b82f6"
              stroke="#fff"
              strokeWidth={1.5}
              style={{ cursor: onCountryClick ? "pointer" : "default" }}
            />
          </Marker>
        ))}
      </ComposableMap>

      <div className="px-4 pb-3 text-xs text-gray-400 text-center">
        {mode === "material"
          ? "線の太さ = 輸入額の大きさ。輸出国をクリックすると国別調査に切り替わります"
          : "ハイライトされた国が選択中の輸出国です"}
      </div>
    </div>
  );
}
