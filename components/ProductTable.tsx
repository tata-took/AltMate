"use client";

export interface TradeProduct {
  cmdCode: string;
  cmdDesc: string;
  qty: number;
  primaryValue: number;
}

interface ProductTableProps {
  products: TradeProduct[];
  onProductClick?: (cmdCode: string, cmdDesc: string) => void;
}

export default function ProductTable({ products, onProductClick }: ProductTableProps) {
  if (products.length === 0) {
    return <p className="text-gray-400 text-sm">データがありません</p>;
  }

  const total = products.reduce((s, p) => s + p.primaryValue, 0);

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="text-left px-4 py-3 text-gray-500 font-medium w-8">#</th>
            <th className="text-left px-4 py-3 text-gray-500 font-medium">品目</th>
            <th className="text-left px-4 py-3 text-gray-500 font-medium">HSコード</th>
            <th className="text-right px-4 py-3 text-gray-500 font-medium">輸入額</th>
            <th className="text-right px-4 py-3 text-gray-500 font-medium">シェア</th>
            <th className="px-4 py-3 w-32"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {products.map((p, i) => {
            const share = total > 0 ? (p.primaryValue / total) * 100 : 0;
            return (
              <tr key={p.cmdCode} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 text-gray-400">{i + 1}</td>
                <td className="px-4 py-3 font-medium text-gray-900 max-w-xs">
                  <span title={p.cmdDesc}>
                    {p.cmdDesc.length > 50 ? p.cmdDesc.slice(0, 50) + "…" : p.cmdDesc}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500 font-mono text-xs">{p.cmdCode}</td>
                <td className="px-4 py-3 text-right text-gray-700">
                  ${(p.primaryValue / 1e6).toFixed(1)}M
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <div className="w-20 bg-gray-100 rounded-full h-1.5">
                      <div
                        className="bg-indigo-500 h-1.5 rounded-full"
                        style={{ width: `${share}%` }}
                      />
                    </div>
                    <span className="text-gray-600 w-10 text-right">{share.toFixed(1)}%</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  {onProductClick && (
                    <button
                      onClick={() => onProductClick(p.cmdCode, p.cmdDesc)}
                      className="text-xs text-indigo-600 hover:text-indigo-800 hover:underline"
                    >
                      輸出国を調査
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
