import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

export interface HsCodeResult {
  hsCode: string;
  description: string;
  confidence: string;
}

export async function getHsCode(industry: string, material: string): Promise<HsCodeResult> {
  const message = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 256,
    messages: [
      {
        role: "user",
        content: `あなたは貿易の専門家です。以下の業種で使用する材料に最も適したHSコード（国際統一商品分類）を1つ答えてください。

業種: ${industry}
材料: ${material}

必ずJSON形式のみで回答してください。余分なテキストは不要です。
{
  "hsCode": "6桁のHSコード（例: 381400）",
  "description": "品目の英語説明",
  "confidence": "high/medium/low"
}`,
      },
    ],
  });

  const text = message.content[0].type === "text" ? message.content[0].text : "";
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("HSコードの取得に失敗しました");
  return JSON.parse(jsonMatch[0]) as HsCodeResult;
}
