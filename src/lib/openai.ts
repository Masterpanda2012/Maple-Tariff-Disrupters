import OpenAI from "openai";
import { z } from "zod";
import type { BusinessProfile, NewsArticle } from "../../generated/prisma";
import playbookData from "~/data/playbook/actions.json";
import { ECONOMIC_ALERT_DISCLAIMER } from "~/lib/economic/constants";
import { env } from "~/env";

const DEFAULT_MODEL = "gpt-4o-mini";

const llmReportSchema = z.object({
  title: z.string().min(1),
  whatChanged: z.string().min(1),
  howItAffects: z.string().min(1),
  whatToDo: z.array(z.string()).min(2).max(6),
  severity: z.enum(["Watch", "Caution", "Act Now"]),
});

export type ReportSectionsPayload = {
  whatChanged: string;
  howItAffects: string;
  whatToDo: string[];
  disclaimer: string;
};

export type GenerateBusinessReportResult = {
  title: string;
  report: string;
  severity: "Watch" | "Caution" | "Act Now";
  reportSections: ReportSectionsPayload;
};

/** Raised when the model response is missing, not JSON, or fails schema validation. */
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

function buildReportBody(
  sections: Omit<ReportSectionsPayload, "disclaimer">,
): string {
  const lines = [
    "## What changed",
    sections.whatChanged.trim(),
    "",
    "## How it affects your business",
    sections.howItAffects.trim(),
    "",
    "## What to do",
    ...sections.whatToDo.map((a, i) => `${i + 1}. ${a.trim()}`),
    "",
    ECONOMIC_ALERT_DISCLAIMER,
  ];
  return lines.join("\n");
}

function playbookPromptSnippet(): string {
  const entries = playbookData.entries ?? [];
  return JSON.stringify(entries.slice(0, 4), null, 0);
}

/**
 * PFD-aligned economic alert: maps news + business exposure into plain-English sections
 * (What changed / How it affects you / What to do) plus severity and legal disclaimer.
 */
export async function generateBusinessReport(
  newsItems: NewsArticle[],
  profile: BusinessProfile,
): Promise<GenerateBusinessReportResult> {
  const disclaimerBlock: ReportSectionsPayload = {
    whatChanged: "",
    howItAffects: "",
    whatToDo: [],
    disclaimer: ECONOMIC_ALERT_DISCLAIMER,
  };

  if (newsItems.length === 0) {
    const what =
      "There are no matching economic news articles for your profile in the database right now.";
    const affects =
      "Once feeds are refreshed and articles align with your industry and supply chain, you will see tailored impact notes here.";
    return {
      title: "No matching news yet",
      severity: "Watch",
      reportSections: {
        ...disclaimerBlock,
        whatChanged: what,
        howItAffects: affects,
        whatToDo: [
          "Complete or update your business exposure profile so relevance scoring can improve.",
          "Run “Generate new report” after the next scheduled news or FX polling cycle.",
        ],
      },
      report: buildReportBody({
        whatChanged: what,
        howItAffects: affects,
        whatToDo: [
          "Complete or update your business exposure profile so relevance scoring can improve.",
          "Run “Generate new report” after the next scheduled news or FX polling cycle.",
        ],
      }),
    };
  }

  const openai = getOpenAI();
  const suppliersLabel = jsonToLabel(profile.suppliers);
  const exposureLabel = jsonToLabel(profile.exposureProfile);

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
    "You are an economic intelligence advisor for Canadian small businesses (MTD / PFD-style alerts).",
    "Respond with a single JSON object only (no markdown fences). Keys: title, whatChanged, howItAffects, whatToDo, severity.",
    "whatChanged: 1–2 sentences — factual summary of the economic event and magnitude, grounded ONLY in the supplied articles.",
    "howItAffects: 2–4 sentences — tie the signal to this business using industry, suppliers, mission, description, and optional exposure profile fields. Give qualitative impact; if precise dollars are unknown, say so and give a percentage range or order-of-magnitude wording.",
    "whatToDo: array of 2–4 concrete, time-bound actions. Align tone with this curated playbook (examples, adapt as needed):",
    playbookPromptSnippet(),
    `severity: one of Watch | Caution | Act Now — Watch = monitor; Caution = plan mitigations soon; Act Now = urgent operational response.`,
    "Do not invent government URLs or statistics not implied by the articles. Use clear Canadian English.",
    `Every alert must be consistent with this disclaimer text (do not omit from your reasoning): ${ECONOMIC_ALERT_DISCLAIMER}`,
  ].join(" ");

  const user = [
    `Company: ${profile.companyName}`,
    `Industry: ${profile.industry}`,
    `Suppliers (structured): ${suppliersLabel}`,
    `Exposure profile (JSON, optional): ${exposureLabel || "{}"}`,
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

  const d = result.data;
  const reportSections: ReportSectionsPayload = {
    whatChanged: d.whatChanged,
    howItAffects: d.howItAffects,
    whatToDo: d.whatToDo,
    disclaimer: ECONOMIC_ALERT_DISCLAIMER,
  };

  return {
    title: d.title,
    severity: d.severity,
    reportSections,
    report: buildReportBody({
      whatChanged: d.whatChanged,
      howItAffects: d.howItAffects,
      whatToDo: d.whatToDo,
    }),
  };
}
