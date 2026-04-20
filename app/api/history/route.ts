import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const history = await prisma.searchHistory.findMany({
    orderBy: { createdAt: "desc" },
    take: 20,
    select: {
      id: true,
      mode: true,
      industry: true,
      material: true,
      country: true,
      hsCode: true,
      createdAt: true,
    },
  });
  return NextResponse.json(history);
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "id は必須です" }, { status: 400 });
  }
  await prisma.searchHistory.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
