"use client";

import { useEffect, useRef } from "react";
import * as d3 from "d3";
import { sankey, sankeyLinkHorizontal, SankeyNode } from "d3-sankey";

interface SankeyNodeData {
  name: string;
  category: "source" | "middle" | "target";
}

interface SankeyLinkData {
  source: number;
  target: number;
  value: number;
}

interface SankeyViewProps {
  centerLabel: string;
  items: { name: string; value: number }[];
  mode: "material" | "country";
  onItemClick?: (name: string) => void;
}

export default function SankeyView({ centerLabel, items, mode, onItemClick }: SankeyViewProps) {
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!ref.current || items.length === 0) return;

    const width = ref.current.clientWidth || 700;
    const height = Math.max(400, items.length * 30 + 80);
    ref.current.setAttribute("height", String(height));

    const svg = d3.select(ref.current);
    svg.selectAll("*").remove();

    const nodes: SankeyNodeData[] = [];
    const links: SankeyLinkData[] = [];

    if (mode === "material") {
      // Sources (countries) → center (material) → Japan
      nodes.push({ name: "日本", category: "target" });       // 0
      nodes.push({ name: centerLabel, category: "middle" });   // 1
      items.forEach((item) => nodes.push({ name: item.name, category: "source" })); // 2+

      items.forEach((item, i) => {
        links.push({ source: i + 2, target: 1, value: item.value });
      });
      links.push({ source: 1, target: 0, value: items.reduce((s, v) => s + v.value, 0) });
    } else {
      // Source (country) → products → Japan
      nodes.push({ name: centerLabel, category: "source" });   // 0
      nodes.push({ name: "日本", category: "target" });        // 1
      items.forEach((item) => nodes.push({ name: item.name, category: "middle" })); // 2+

      items.forEach((item, i) => {
        links.push({ source: 0, target: i + 2, value: item.value });
        links.push({ source: i + 2, target: 1, value: item.value });
      });
    }

    const graph = sankey<SankeyNodeData, SankeyLinkData>()
      .nodeWidth(15)
      .nodePadding(10)
      .extent([[20, 20], [width - 180, height - 20]])(
      { nodes: nodes.map((d) => ({ ...d })), links: links.map((d) => ({ ...d })) }
    );

    const colorScale = d3.scaleOrdinal(d3.schemeTableau10);

    svg
      .append("g")
      .selectAll("path")
      .data(graph.links)
      .join("path")
      .attr("d", sankeyLinkHorizontal())
      .attr("fill", "none")
      .attr("stroke", (d) => {
        const s = d.source as SankeyNode<SankeyNodeData, SankeyLinkData>;
        return colorScale(s.name ?? "");
      })
      .attr("stroke-opacity", 0.4)
      .attr("stroke-width", (d) => Math.max(1, d.width ?? 1));

    const node = svg
      .append("g")
      .selectAll("g")
      .data(graph.nodes)
      .join("g")
      .style("cursor", (d) => (d.category === "middle" && onItemClick ? "pointer" : "default"))
      .on("click", (_event, d) => {
        if (d.category === "middle" && onItemClick) onItemClick(d.name);
      });

    node
      .append("rect")
      .attr("x", (d) => d.x0 ?? 0)
      .attr("y", (d) => d.y0 ?? 0)
      .attr("height", (d) => Math.max(1, (d.y1 ?? 0) - (d.y0 ?? 0)))
      .attr("width", (d) => (d.x1 ?? 0) - (d.x0 ?? 0))
      .attr("fill", (d) => colorScale(d.name ?? ""))
      .attr("rx", 3);

    node
      .append("text")
      .attr("x", (d) => ((d.x0 ?? 0) < width / 2 ? (d.x1 ?? 0) + 6 : (d.x0 ?? 0) - 6))
      .attr("y", (d) => ((d.y0 ?? 0) + (d.y1 ?? 0)) / 2)
      .attr("dy", "0.35em")
      .attr("text-anchor", (d) => ((d.x0 ?? 0) < width / 2 ? "start" : "end"))
      .attr("font-size", 11)
      .attr("fill", "#374151")
      .text((d) => {
        const label = d.name ?? "";
        return label.length > 20 ? label.slice(0, 20) + "…" : label;
      });
  }, [centerLabel, items, mode, onItemClick]);

  if (items.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-xl border border-gray-200 text-gray-400">
        データがありません
      </div>
    );
  }

  return (
    <div className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
      <svg ref={ref} style={{ width: "100%", minHeight: 400 }} />
      {onItemClick && (
        <p className="text-xs text-gray-400 text-center pb-3">
          品目ノードをクリックすると材料起点の検索に切り替わります
        </p>
      )}
    </div>
  );
}
