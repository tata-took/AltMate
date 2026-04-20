import { NextResponse } from "next/server";
import { getCountryList } from "@/lib/comtrade";

let cachedCountries: Awaited<ReturnType<typeof getCountryList>> | null = null;

export async function GET() {
  if (!cachedCountries) {
    cachedCountries = await getCountryList();
  }
  return NextResponse.json(cachedCountries);
}
