import { NextRequest, NextResponse } from "next/server";
import { getHsCode } from "@/lib/claude";
import { getImportsByMaterial } from "@/lib/comtrade";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { industry, material } = await req.json();
    if (!industry || !material) {
      return NextResponse.json({ error: "業種と材料名は必須です" }, { status: 400 });
    }

    // Check HS code cache first
    let hsCode: string;
    let hsDesc: string;
    const cached = await prisma.hsCodeCache.findUnique({
      where: { industry_material: { industry, material } },
    });

    if (cached) {
      hsCode = cached.hsCode;
      hsDesc = cached.hsDesc;
    } else {
      const result = await getHsCode(industry, material);
      hsCode = result.hsCode.replace(/\./g, "");
      hsDesc = result.description;
      await prisma.hsCodeCache.create({
        data: { industry, material, hsCode, hsDesc },
      });
    }

    const partners = await getImportsByMaterial(hsCode);

    const record = await prisma.searchHistory.create({
      data: {
        mode: "material",
        industry,
        material,
        hsCode,
        results: JSON.stringify(partners),
      },
    });

    return NextResponse.json({ id: record.id, hsCode, hsDesc, partners });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "エラーが発生しました" },
      { status: 500 }
    );
  }
}
