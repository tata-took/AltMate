import { NextRequest, NextResponse } from "next/server";
import { getExportsByCountry } from "@/lib/comtrade";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { countryCode, countryName } = await req.json();
    if (!countryCode) {
      return NextResponse.json({ error: "国コードは必須です" }, { status: 400 });
    }

    const products = await getExportsByCountry(countryCode);

    const record = await prisma.searchHistory.create({
      data: {
        mode: "country",
        country: countryName ?? countryCode,
        results: JSON.stringify(products),
      },
    });

    return NextResponse.json({ id: record.id, countryCode, countryName, products });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "エラーが発生しました" },
      { status: 500 }
    );
  }
}
