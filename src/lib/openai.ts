import OpenAI from "openai";
import { z } from "zod";
import type { BusinessProfile, NewsArticle } from "../../generated/prisma";
import { env } from "~/env";

const DEFAULT_MODEL = "gpt-4o-mini";

const llmReportSchema = z.object({
  title: z.string().min(1),
  report: z.string().min(1),
});

/** Raised when the model response is missing, not JSON, or fails `{ title, report }` validation. */
export class BusinessReportResponseError extends Error {
  readonly code: "empty_content" | "invalid_json" | "invalid_schema";

  constructor(
    code: BusinessReportResponseError["code"],
    message: string,
    options?: ErrorOptions,
  ) {
    super(message, options);
    this.name = "BusinessReportResponseError";
    this.code = code;
  }
}

let openaiSingleton: OpenAI | undefined;

function getOpenAI(): OpenAI {
  const key = env.OPENAI_API_KEY;
  if (!key) {
    throw new Error(
      "OPENAI_API_KEY is not set; cannot generate a business report.",
    );
  }
  openaiSingleton ??= new OpenAI({ apiKey: key });
  return openaiSingleton;
}

function modelId(): string {
  const raw = process.env.OPENAI_MODEL?.trim();
  if (raw) return raw;
  return DEFAULT_MODEL;
}

function jsonToLabel(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value;
  try {
    return JSON.stringify(value);
  } catch {
    return "[unserializable value]";
  }
}

/**
 * Uses the OpenAI API to turn tagged news articles and a business profile into a dashboard-ready
 * report: a short title plus a body that summarizes tariff / economic exposure and lists concrete
 * short-term and long-term actions, grounded in the supplied articles.
 *
 * **Happy path:** One or more `newsItems` and a valid `OPENAI_API_KEY`; model returns JSON with
 * `title` and `report`, which are validated and returned.
 *
 * **Edge cases:** If `newsItems` is empty, returns a fixed message without calling OpenAI (no API
 * key required). Article text is capped in the prompt to limit token usage on large summaries.
 *
 * **Error cases:** Throws if the API key is missing when articles are present; throws if the
 * model response is missing, invalid JSON, or fails schema validation; surfaces OpenAI/network
 * errors from the SDK.
 */
export async function generateBusinessReport(
  newsItems: NewsArticle[],
  profile: BusinessProfile,
): Promise<{ title: string; report: string }> {
  if (newsItems.length === 0) {
    return {
      title: "No matching news yet",
      report:
        "There are no tagged news articles in the database for your profile right now. Check back after the next news fetch, or broaden your industry and supplier tags when editing your business profile.",
    };
  }

  const openai = getOpenAI();
  const suppliersLabel = jsonToLabel(profile.suppliers);

  const articlesBlock = newsItems
    .map((a, i) => {
      const tagsLabel = jsonToLabel(a.tags);
      const summary =
        a.summary.length > 2_000
          ? `${a.summary.slice(0, 2_000)}…`
          : a.summary;
      return [
        `Article ${i + 1}:`,
        `Title: ${a.title}`,
        `URL: ${a.url}`,
        `Published: ${a.publishedAt.toISOString()}`,
        `Tags: ${tagsLabel}`,
        `Summary: ${summary}`,
      ].join("\n");
    })
    .join("\n\n---\n\n");

  const system = [
    "You are an economic and trade advisor helping Canadian businesses respond to tariffs and global supply shocks.",
    "Given a business profile and a set of news articles, produce a concise report.",
    "Respond with a single JSON object only (no markdown fences) with keys: title (string), report (string).",
    "The report must: (1) explain which developments matter for this business, (2) separate short-term actions from long-term actions to limit economic loss, (3) cite which articles informed each major point using titles or URLs.",
    "Use clear Canadian English. Be practical and specific to the profile (industry, suppliers, mission).",
  ].join(" ");

  const user = [
    `Company: ${profile.companyName}`,
    `Industry: ${profile.industry}`,
    `Suppliers (structured): ${suppliersLabel}`,
    `Mission: ${profile.mission}`,
    `Description: ${profile.description}`,
    "",
    "News articles:",
    articlesBlock,
  ].join("\n");

  const completion = await openai.chat.completions.create({
    model: modelId(),
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
  });

  const raw = completion.choices[0]?.message?.content;
  if (!raw) {
    throw new BusinessReportResponseError(
      "empty_content",
      "OpenAI returned no message content for the business report.",
    );
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (e) {
    throw new BusinessReportResponseError(
      "invalid_json",
      "OpenAI returned non-JSON content for the business report.",
      { cause: e },
    );
  }

  const result = llmReportSchema.safeParse(parsed);
  if (!result.success) {
    throw new BusinessReportResponseError(
      "invalid_schema",
      `OpenAI JSON did not match the expected shape: ${result.error.message}`,
      { cause: result.error },
    );
  }

  return result.data;
}
