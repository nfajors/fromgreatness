import { env, aiEnabled } from "./env";

/**
 * AI content generation for personalized study plans.
 *
 * Given a student's age, self-reported identity, confirmed heritage regions and
 * assessment traits, we ask Claude to author a unique set of learning modules
 * per cultural domain. Output is strict JSON matching our study-module shape.
 *
 * If ANTHROPIC_API_KEY is not configured the caller should fall back to the
 * static template library so the app still works in development.
 */

export type GenLesson = {
  title: string;
  type: "video" | "reading" | "quiz" | "activity";
  duration: number;
  content?: string;
};

export type GenModule = {
  title: string;
  description: string;
  lessons: GenLesson[];
};

export type GenInput = {
  domain: "history" | "language" | "food" | "dress";
  studentAge: number;
  selfReportedIdentity?: string | null;
  heritageRegions: Array<{ region: string; percentage?: number }>;
  traits: string[];
  intensity: "low" | "medium" | "high";
};

const DOMAIN_GUIDANCE: Record<GenInput["domain"], string> = {
  history:
    "ancestral civilizations, kingdoms, key historical figures, and the through-line connecting the past to the student's present identity",
  language:
    "a heritage language tied to the student's ancestry: greetings, family terms, numbers, and culturally grounded phrases",
  food:
    "traditional dishes, their cultural meaning, ingredients, and hands-on cooking activities families can do together",
  dress:
    "traditional garments, textiles and patterns, their symbolic meaning, and how heritage shows up in modern fashion",
};

function buildPrompt(input: GenInput): string {
  const regions = input.heritageRegions
    .map((r) =>
      r.percentage != null ? `${r.region} (~${r.percentage}%)` : r.region,
    )
    .join(", ");
  const moduleCount =
    input.intensity === "high" ? 4 : input.intensity === "low" ? 2 : 3;

  return `You are a curriculum designer for fromGreatness, a platform that reconnects young people (ages 8-15) to their genetic heritage through culturally grounded, confidence-building education.

Design a ${input.domain} study plan for one specific child.

CHILD PROFILE
- Age: ${input.studentAge}
- Currently identifies as: ${input.selfReportedIdentity ?? "not specified"}
- Confirmed heritage regions: ${regions || "not specified"}
- Personality traits: ${input.traits.join(", ") || "curious, creative"}

DOMAIN FOCUS: ${input.domain} — ${DOMAIN_GUIDANCE[input.domain]}

REQUIREMENTS
- Author exactly ${moduleCount} modules, ordered from foundational to advanced.
- Ground every module in the child's *specific* confirmed heritage regions above — name real cultures, places, languages, dishes, or garments from those regions. Do not produce generic "African heritage" content if more specific regions are known.
- Age-appropriate for a ${input.studentAge}-year-old: tone, vocabulary, and lesson length.
- Each module has 3-5 lessons. Lesson types: "video", "reading", "quiz", "activity". Include at least one "activity" the family can do together.
- "duration" is an integer number of minutes (10-45).
- Be encouraging and identity-affirming. Connect heritage to the child's stated traits where natural.

OUTPUT FORMAT
Respond with ONLY a JSON array (no markdown, no prose) of this exact shape:
[
  {
    "title": "string",
    "description": "string (1-2 sentences)",
    "lessons": [
      { "title": "string", "type": "video|reading|quiz|activity", "duration": 15, "content": "string (1-2 sentence summary of what the lesson covers)" }
    ]
  }
]`;
}

type AnthropicResponse = {
  content: Array<{ type: string; text?: string }>;
};

export async function generateModulesWithAI(
  input: GenInput,
): Promise<GenModule[]> {
  if (!aiEnabled) {
    throw new Error("AI generation not configured");
  }

  const resp = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": env.anthropicApiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: env.anthropicModel,
      max_tokens: 4000,
      messages: [{ role: "user", content: buildPrompt(input) }],
    }),
  });

  if (!resp.ok) {
    const body = await resp.text();
    throw new Error(`Anthropic API error (${resp.status}): ${body.slice(0, 300)}`);
  }

  const data = (await resp.json()) as AnthropicResponse;
  const text = data.content
    .map((c) => (c.type === "text" ? c.text ?? "" : ""))
    .join("")
    .trim();

  const json = extractJsonArray(text);
  const parsed = JSON.parse(json) as GenModule[];

  // Defensive normalisation so bad model output can't break the DB insert.
  return parsed
    .filter((m) => m && typeof m.title === "string")
    .map((m) => ({
      title: String(m.title).slice(0, 250),
      description: String(m.description ?? "").slice(0, 1000),
      lessons: (Array.isArray(m.lessons) ? m.lessons : [])
        .filter((l) => l && typeof l.title === "string")
        .map((l) => ({
          title: String(l.title).slice(0, 250),
          type: (["video", "reading", "quiz", "activity"].includes(l.type)
            ? l.type
            : "reading") as GenLesson["type"],
          duration:
            Number.isFinite(l.duration) && l.duration > 0
              ? Math.min(60, Math.round(l.duration))
              : 15,
          content: l.content ? String(l.content).slice(0, 1000) : undefined,
        })),
    }));
}

/** Pull the first JSON array out of a possibly-fenced model response. */
function extractJsonArray(text: string): string {
  const fenced = text.replace(/```json|```/g, "").trim();
  const start = fenced.indexOf("[");
  const end = fenced.lastIndexOf("]");
  if (start === -1 || end === -1 || end < start) {
    throw new Error("No JSON array found in AI response");
  }
  return fenced.slice(start, end + 1);
}

// ─────────────────────────────────────────────────────────────
//  DNA-driven assessment question generation (core IP)
//  Generates heritage-specific questions for the Achievement and
//  Cultural Identity tests, grounded in the child's confirmed
//  ancestry regions. Falls back to static questions when AI is off.
// ─────────────────────────────────────────────────────────────

export type GenQuestion = {
  id: number;
  text: string;
  options: string[];
  correctIndex: number;
  domain: string;
  difficulty: "easy" | "medium" | "hard";
};

export type GenQuestionInput = {
  test: "achievement" | "cultural_identity";
  studentAge: number;
  heritageRegions: Array<{ region: string; percentage?: number }>;
  count: number;
};

function buildQuestionPrompt(input: GenQuestionInput): string {
  const regions = input.heritageRegions
    .map((r) => (r.percentage != null ? `${r.region} (~${r.percentage}%)` : r.region))
    .join(", ");

  const testGuidance =
    input.test === "achievement"
      ? `an ACHIEVEMENT test that measures what the child already KNOWS about their specific heritage — factual knowledge across history, language, food, and dress of their confirmed ancestry regions. Each question has one clearly correct answer.`
      : `a CULTURAL IDENTITY test that gauges how connected the child feels to, and how much they engage with, their specific heritage — traditions, language exposure, family practices, and self-identification. Frame options as a spectrum; set correctIndex to the most heritage-connected answer.`;

  return `You are designing questions for fromGreatness, a platform that reconnects young people (ages 8-15) with their genetic heritage.

Design ${input.count} questions for ${testGuidance}

CHILD PROFILE
- Age: ${input.studentAge}
- Confirmed heritage regions: ${regions || "unspecified"}

CRITICAL REQUIREMENTS
- Ground EVERY question in the child's SPECIFIC confirmed regions above. Name real cultures, languages, dishes, garments, kingdoms, and figures from THOSE regions. Do not produce generic "African" or "world" questions if specific regions are known.
- Be factually accurate. Do NOT rely on stereotypes, caricatures, or clichés. If unsure of a fact, choose a different, verifiable one.
- Age-appropriate for a ${input.studentAge}-year-old in vocabulary and difficulty.
- Exactly 4 options per question; exactly one correctIndex (0-3).
- Vary difficulty: mix "easy", "medium", "hard".
- Respectful, dignity-affirming tone. This is about pride in heritage, never mockery.

OUTPUT FORMAT
Respond with ONLY a JSON array (no markdown, no prose):
[
  { "text": "string", "options": ["a","b","c","d"], "correctIndex": 0, "domain": "History|Language|Food|Dress|Identity", "difficulty": "easy" }
]`;
}

export async function generateQuestionsWithAI(
  input: GenQuestionInput,
): Promise<GenQuestion[]> {
  if (!aiEnabled) throw new Error("AI generation not configured");

  const resp = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": env.anthropicApiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: env.anthropicModel,
      max_tokens: 4000,
      messages: [{ role: "user", content: buildQuestionPrompt(input) }],
    }),
  });

  if (!resp.ok) {
    const body = await resp.text();
    throw new Error(`Anthropic API error (${resp.status}): ${body.slice(0, 300)}`);
  }

  const data = (await resp.json()) as { content: Array<{ type: string; text?: string }> };
  const text = data.content.map((c) => (c.type === "text" ? c.text ?? "" : "")).join("").trim();
  const parsed = JSON.parse(extractJsonArray(text)) as GenQuestion[];

  return parsed
    .filter((q) => q && typeof q.text === "string" && Array.isArray(q.options) && q.options.length === 4)
    .map((q, i) => ({
      id: i + 1,
      text: String(q.text).slice(0, 500),
      options: q.options.map((o) => String(o).slice(0, 200)),
      correctIndex: Number.isInteger(q.correctIndex) && q.correctIndex >= 0 && q.correctIndex <= 3 ? q.correctIndex : 0,
      domain: String(q.domain || "Identity").slice(0, 40),
      difficulty: (["easy", "medium", "hard"].includes(q.difficulty) ? q.difficulty : "medium") as GenQuestion["difficulty"],
    }));
}
