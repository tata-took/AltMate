"use client";

import { MapPartner } from "./WorldMapView";

interface CountryTableProps {
  partners: MapPartner[];
  onCountryClick?: (countryCode: string, countryName: string) => void;
}

export default function CountryTable({ partners, onCountryClick }: CountryTableProps) {
  if (partners.length === 0) {
    return <p className="text-gray-400 text-sm">データがありません</p>;
  }

  const total = partners.reduce((s, p) => s + p.primaryValue, 0);

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="text-left px-4 py-3 text-gray-500 font-medium w-8">#</th>
            <th className="text-left px-4 py-3 text-gray-500 font-medium">国名</th>
            <th className="text-right px-4 py-3 text-gray-500 font-medium">輸入額</th>
            <th className="text-right px-4 py-3 text-gray-500 font-medium">シェア</th>
            <th className="px-4 py-3 w-32"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {partners.map((p, i) => {
            const share = total > 0 ? (p.primaryValue / total) * 100 : 0;
            return (
              <tr key={p.partnerCode} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 text-gray-400">{i + 1}</td>
                <td className="px-4 py-3 font-medium text-gray-900">{p.partnerDesc}</td>
                <td className="px-4 py-3 text-right text-gray-700">
                  ${(p.primaryValue / 1e6).toFixed(1)}M
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <div className="w-20 bg-gray-100 rounded-full h-1.5">
                      <div
                        className="bg-blue-500 h-1.5 rounded-full"
                        style={{ width: `${share}%` }}
                      />
                    </div>
                    <span className="text-gray-600 w-10 text-right">{share.toFixed(1)}%</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  {onCountryClick && (
                    <button
                      onClick={() => onCountryClick(p.partnerCode, p.partnerDesc)}
                      className="text-xs text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      この国を調査
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
