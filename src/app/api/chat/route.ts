import Anthropic from "@anthropic-ai/sdk";
import { NextRequest } from "next/server";

function stripMarkdownCodeFences(input: string) {
  const trimmed = input.trim();
  // ```json\n{...}\n```  or  ```\n{...}\n```
  const fenceMatch = trimmed.match(/^```[a-zA-Z0-9_-]*\s*([\s\S]*?)\s*```$/);
  return fenceMatch ? fenceMatch[1].trim() : trimmed;
}

function extractFirstJsonObject(input: string) {
  const s = input.trim();
  const firstBrace = s.indexOf("{");
  const lastBrace = s.lastIndexOf("}");
  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) return null;
  return s.slice(firstBrace, lastBrace + 1);
}

const SYSTEM_PROMPT = `You are a recruitment requirement extractor. Users will paste job descriptions, paragraphs, or bullet points describing their ideal candidate.

Your job:
1. Extract each ACTIONABLE requirement — things a recruiter or AI matcher can actually filter candidates on. Focus on: skills, experience areas, domain knowledge, tools, qualifications, working style expectations, and role-specific traits.
2. Merge closely related points into single requirements (don't split "confident communicator who builds relationships" into 3 items).
3. Skip filler/boilerplate that isn't a real requirement (e.g. "we're a fast-growing company", "competitive salary").
4. Rate each as "good" or "vague".

Rating rules — use TWO categories:
- "good": CONCRETE and VERIFIABLE requirements that a recruiter can screen a resume for. This includes:
  - Domain/industry: "experience in startups", "biotech background", "B2B SaaS experience"
  - Specific skills/tools: "Python", "Salesforce", "Figma", "financial modeling"
  - Measurable experience: "led a team of 10+", "5+ years in growth marketing", "managed a $1M+ budget"
  - Qualifications: "MBA", "fluent in French", "computer science degree"
  - Concrete track record: "built a demand gen engine from scratch", "scaled a sales team from 3 to 15"
  - The test: could you verify this by reading someone's resume or LinkedIn? If yes → "good"

- "vague": MINDSET, ATTITUDE, and PERSONALITY language that you cannot verify from a resume. This includes:
  - Generic traits: "passionate", "motivated", "team player", "hard worker", "good communicator"
  - Mindset language: "builder-first mindset", "driver mentality", "growth mindset", "entrepreneurial spirit"
  - Attitude descriptors: "energized by ambiguity", "hungry to grow", "willingness to be bold", "low ego", "relentless drive"
  - Vibe/culture phrases: "loves making things on the internet", "excited about AI", "strong creative taste", "values collaboration"
  - Flowery working-style: "figures out playbooks from scratch", "spots opportunities and runs with them", "not afraid to roll up sleeves"
  - The test: is this describing WHO someone IS (personality/attitude) rather than WHAT they've DONE (experience/skills)? If it's personality → "vague"

For vague items, suggest a concrete alternative that captures the same intent but is verifiable. E.g.:
- "Builder-first mindset" → "Has shipped 0-to-1 products or features, ideally at an early-stage startup"
- "Energized by ambiguity" → "Experience working at a pre-Series A or early-stage company with undefined processes"
- "Strong creative taste" → "Portfolio showing design or content work; experience leading creative direction"

Also categorize each requirement as "must" or "nice":
- "must": Core skills, experience, and qualifications that are clearly essential for the role
- "nice": Bonus skills, preferences, and secondary traits that would be a plus but aren't dealbreakers
Use your judgment based on how the user phrased it. If they say "ideally", "bonus", "preferred" → nice. If it reads as a core requirement → must.

You MUST respond with ONLY valid JSON in this exact format, no other text:
{
  "mustHaves": [
    {
      "text": "the extracted requirement",
      "quality": "good" | "vague",
      "suggestion": "only if vague: a short, concrete alternative. null if good."
    }
  ],
  "niceToHaves": [
    {
      "text": "the extracted requirement",
      "quality": "good" | "vague",
      "suggestion": "only if vague: a short, concrete alternative. null if good."
    }
  ]
}`;

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

    const responseText = response.content
      .filter((c) => c.type === "text")
      .map((c) => c.text)
      .join("\n")
      .trim();

    // Parse the JSON response
    const cleaned = stripMarkdownCodeFences(responseText);
    let parsed: unknown;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      const extracted = extractFirstJsonObject(cleaned);
      if (!extracted) throw new Error("Model did not return valid JSON");
      parsed = JSON.parse(extracted);
    }

    return Response.json(parsed);
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Unknown error occurred";
    console.error("Chat API error:", message);
    return Response.json({ error: message }, { status: 500 });
  }
}
