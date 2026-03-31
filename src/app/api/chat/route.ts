import Anthropic from "@anthropic-ai/sdk";
import { NextRequest } from "next/server";

const SYSTEM_PROMPT = `You are a recruitment requirement extractor. The user will describe their ideal candidate in a paragraph or freeform text.

Your job:
1. Extract each distinct requirement/skill/qualification from their text
2. For EACH extracted requirement, rate its quality as "good" or "vague"
3. If a requirement is vague, provide a brief suggestion for how to make it more specific

Rules for rating — be LENIENT, not harsh:
- "good": Anything that gives meaningful direction, even without exact numbers. Domain-specific terms count as specific. Examples: "experience in startups", "bio background", "B2B SaaS experience", "growth marketing skills", "Python proficiency", "team leadership" — these are ALL "good" because they point to a clear domain, skill, or context that a recruiter can act on.
- "vague": ONLY flag truly empty/generic personality traits that could apply to anyone in any role. Examples: "good communicator", "hard worker", "team player", "motivated", "passionate", "strong leader", "good culture fit", "nice person". These say nothing about domain, skill, or experience.

When in doubt, rate as "good". Only flag the obviously generic stuff.

You MUST respond with ONLY valid JSON in this exact format, no other text:
{
  "requirements": [
    {
      "text": "the extracted requirement",
      "quality": "good" | "vague",
      "suggestion": "optional suggestion to improve, only if vague, otherwise null"
    }
  ]
}

Extract at least 3 requirements if possible. If the text is very short, extract what you can.`;

export async function POST(req: NextRequest) {
  try {
    const { text } = (await req.json()) as { text: string };

    if (!process.env.ANTHROPIC_API_KEY) {
      return Response.json(
        {
          error:
            "ANTHROPIC_API_KEY not set. Add it to .env.local: ANTHROPIC_API_KEY=sk-ant-...",
        },
        { status: 500 }
      );
    }

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: text }],
    });

    const responseText =
      response.content[0].type === "text" ? response.content[0].text : "{}";

    // Parse the JSON response
    const parsed = JSON.parse(responseText);

    return Response.json(parsed);
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Unknown error occurred";
    console.error("Chat API error:", message);
    return Response.json({ error: message }, { status: 500 });
  }
}
