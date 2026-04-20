"use client";

export type ViewType = "map" | "sankey";

interface ViewToggleProps {
  view: ViewType;
  onChange: (view: ViewType) => void;
}

export default function ViewToggle({ view, onChange }: ViewToggleProps) {
  return (
    <div className="flex rounded-lg overflow-hidden border border-gray-200 w-fit">
      <button
        onClick={() => onChange("map")}
        className={`px-4 py-2 text-sm font-medium transition-colors ${
          view === "map"
            ? "bg-indigo-600 text-white"
            : "bg-white text-gray-600 hover:bg-gray-50"
        }`}
      >
        世界地図
      </button>
      <button
        onClick={() => onChange("sankey")}
        className={`px-4 py-2 text-sm font-medium transition-colors ${
          view === "sankey"
            ? "bg-indigo-600 text-white"
            : "bg-white text-gray-600 hover:bg-gray-50"
        }`}
      >
        サンキー図
      </button>
    </div>
  );
}
