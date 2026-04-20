const COMTRADE_BASE = "https://comtradeapi.un.org/data/v1/get/C/A/HS";
const JAPAN_CODE = "392";

export interface TradePartner {
  partnerCode: string;
  partnerDesc: string;
  qty: number;
  primaryValue: number;
  iso3: string;
}

export interface TradeProduct {
  cmdCode: string;
  cmdDesc: string;
  qty: number;
  primaryValue: number;
}

function getHeaders() {
  return {
    "Ocp-Apim-Subscription-Key": process.env.COMTRADE_API_KEY ?? "",
  };
}

export async function getImportsByMaterial(hsCode: string): Promise<TradePartner[]> {
  const params = new URLSearchParams({
    reporterCode: JAPAN_CODE,
    flowCode: "M",
    cmdCode: hsCode,
    period: "2023",
    partnerCode: "0",
    includeDesc: "true",
  });

  const res = await fetch(`${COMTRADE_BASE}?${params}`, {
    headers: getHeaders(),
  });

  if (!res.ok) {
    throw new Error(`Comtrade API error: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  const records: Record<string, unknown>[] = data.data ?? [];

  return records
    .filter((r) => r["partnerCode"] !== "0" && r["partnerCode"] !== 0)
    .map((r) => ({
      partnerCode: String(r["partnerCode"]),
      partnerDesc: String(r["partnerDesc"] ?? ""),
      qty: Number(r["qty"] ?? 0),
      primaryValue: Number(r["primaryValue"] ?? 0),
      iso3: String(r["partnerISO"] ?? ""),
    }))
    .sort((a, b) => b.primaryValue - a.primaryValue)
    .slice(0, 20);
}

export async function getExportsByCountry(partnerCode: string): Promise<TradeProduct[]> {
  const params = new URLSearchParams({
    reporterCode: JAPAN_CODE,
    flowCode: "M",
    cmdCode: "TOTAL",
    period: "2023",
    partnerCode,
    includeDesc: "true",
  });

  const res = await fetch(`${COMTRADE_BASE}?${params}`, {
    headers: getHeaders(),
  });

  if (!res.ok) {
    throw new Error(`Comtrade API error: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  const records: Record<string, unknown>[] = data.data ?? [];

  return records
    .filter((r) => r["cmdCode"] !== "TOTAL")
    .map((r) => ({
      cmdCode: String(r["cmdCode"]),
      cmdDesc: String(r["cmdDesc"] ?? ""),
      qty: Number(r["qty"] ?? 0),
      primaryValue: Number(r["primaryValue"] ?? 0),
    }))
    .sort((a, b) => b.primaryValue - a.primaryValue)
    .slice(0, 20);
}

export async function getCountryList(): Promise<{ code: string; name: string; iso3: string }[]> {
  const res = await fetch(
    "https://comtradeapi.un.org/files/v1/app/reference/partnerAreas.json"
  );
  if (!res.ok) return [];
  const data = await res.json();
  return (data.results ?? [])
    .filter((r: Record<string, unknown>) => r["isGroup"] === false)
    .map((r: Record<string, unknown>) => ({
      code: String(r["id"]),
      name: String(r["text"]),
      iso3: String(r["iso3"] ?? ""),
    }));
}
