import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "openai";
import { z } from "zod";
import type { BusinessProfile, NewsArticle } from "../../generated/prisma";
import playbookData from "~/data/playbook/actions.json";
import { ECONOMIC_ALERT_DISCLAIMER } from "~/lib/economic/constants";
import { env } from "~/env";

const DEFAULT_OPENAI_MODEL = "gpt-4o-mini";
const DEFAULT_GROQ_MODEL = "llama-3.3-70b-versatile";
const DEFAULT_OPENROUTER_MODEL = "google/gemma-2-9b-it:free";
const DEFAULT_GEMINI_MODEL = "gemini-2.0-flash";
const DEFAULT_OLLAMA_LOCAL_MODEL = "llama3.2";
/** Ollama Cloud default; see https://ollama.com/search?c=cloud */
const DEFAULT_OLLAMA_CLOUD_MODEL = "gpt-oss:120b";
const DEFAULT_OLLAMA_BASE = "http://127.0.0.1:11434";
const OLLAMA_CLOUD_OPENAI_BASE = "https://ollama.com";

const GROQ_BASE_URL = "https://api.groq.com/openai/v1";
const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1";

const llmReportSchema = z.object({
  title: z.string().min(1),
  whatChanged: z.string().min(1),
  howItAffects: z.string().min(1),
  whatToDo: z.array(z.string()).min(2).max(6),
  severity: z.enum(["Watch", "Caution", "Act Now"]),
});

type LlmProviderId =
  | "openai"
  | "groq"
  | "openrouter"
  | "gemini"
  | "ollama";

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

/** Raised when no provider API key / local server is configured. */
export class LlmConfigurationError extends Error {
  constructor(message?: string) {
    super(
      message ??
        "No LLM configured. Set one of: OPENAI_API_KEY, GROQ_API_KEY, OPENROUTER_API_KEY, GEMINI_API_KEY, OLLAMA_API_KEY (cloud), or LLM_PROVIDER=ollama for local Ollama (see .env.example).",
    );
    this.name = "LlmConfigurationError";
  }
}

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

function envString(value: string | undefined, fallback: string): string {
  const v = value?.trim();
  return v && v.length > 0 ? v : fallback;
}

function envUrlBase(value: string | undefined, fallback: string): string {
  const v = value?.replace(/\/$/, "");
  return v && v.length > 0 ? v : fallback;
}

function resolveLlmProvider(): LlmProviderId | null {
  if (env.LLM_PROVIDER) return env.LLM_PROVIDER;
  if (env.OPENAI_API_KEY) return "openai";
  if (env.GROQ_API_KEY) return "groq";
  if (env.OPENROUTER_API_KEY) return "openrouter";
  if (env.GEMINI_API_KEY) return "gemini";
  if (env.OLLAMA_API_KEY) return "ollama";
  return null;
}

function modelForProvider(provider: LlmProviderId): string {
  switch (provider) {
    case "openai":
      return envString(env.OPENAI_MODEL, DEFAULT_OPENAI_MODEL);
    case "groq":
      return envString(env.GROQ_MODEL, DEFAULT_GROQ_MODEL);
    case "openrouter":
      return envString(env.OPENROUTER_MODEL, DEFAULT_OPENROUTER_MODEL);
    case "gemini":
      return envString(env.GEMINI_MODEL, DEFAULT_GEMINI_MODEL);
    case "ollama":
      if (env.OLLAMA_API_KEY) {
        return envString(env.OLLAMA_MODEL, DEFAULT_OLLAMA_CLOUD_MODEL);
      }
      return envString(env.OLLAMA_MODEL, DEFAULT_OLLAMA_LOCAL_MODEL);
    default: {
      const _: never = provider;
      return _;
    }
  }
}

function assertProviderReady(provider: LlmProviderId): void {
  switch (provider) {
    case "openai":
      if (!env.OPENAI_API_KEY) {
        throw new LlmConfigurationError(
          "LLM_PROVIDER is openai (or inferred) but OPENAI_API_KEY is not set.",
        );
      }
      break;
    case "groq":
      if (!env.GROQ_API_KEY) {
        throw new LlmConfigurationError(
          "LLM_PROVIDER is groq (or inferred) but GROQ_API_KEY is not set.",
        );
      }
      break;
    case "openrouter":
      if (!env.OPENROUTER_API_KEY) {
        throw new LlmConfigurationError(
          "LLM_PROVIDER is openrouter (or inferred) but OPENROUTER_API_KEY is not set.",
        );
      }
      break;
    case "gemini":
      if (!env.GEMINI_API_KEY) {
        throw new LlmConfigurationError(
          "LLM_PROVIDER is gemini (or inferred) but GEMINI_API_KEY is not set.",
        );
      }
      break;
    case "ollama":
      break;
    default: {
      const _: never = provider;
      void _;
    }
  }
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

function buildPrompts(
  newsItems: NewsArticle[],
  profile: BusinessProfile,
): { system: string; user: string } {
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

  return { system, user };
}

function parseModelJson(raw: string, sourceLabel: string): GenerateBusinessReportResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (e) {
    throw new BusinessReportResponseError(
      "invalid_json",
      `${sourceLabel} returned non-JSON content for the business report.`,
      { cause: e },
    );
  }

  const result = llmReportSchema.safeParse(parsed);
  if (!result.success) {
    throw new BusinessReportResponseError(
      "invalid_schema",
      `${sourceLabel} JSON did not match the expected shape: ${result.error.message}`,
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

async function completeOpenAiCompatibleJson(params: {
  baseURL: string;
  apiKey: string;
  model: string;
  system: string;
  user: string;
  defaultHeaders?: Record<string, string | undefined>;
}): Promise<string> {
  const client = new OpenAI({
    apiKey: params.apiKey,
    baseURL: params.baseURL,
    defaultHeaders: params.defaultHeaders,
  });

  const completion = await client.chat.completions.create({
    model: params.model,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: params.system },
      { role: "user", content: params.user },
    ],
  });

  const raw = completion.choices[0]?.message?.content;
  if (!raw) {
    throw new BusinessReportResponseError(
      "empty_content",
      "The chat model returned no message content for the business report.",
    );
  }
  return raw;
}

async function completeGeminiJson(params: {
  apiKey: string;
  model: string;
  system: string;
  user: string;
}): Promise<string> {
  const genAI = new GoogleGenerativeAI(params.apiKey);
  const model = genAI.getGenerativeModel({
    model: params.model,
    systemInstruction: params.system,
    generationConfig: {
      responseMimeType: "application/json",
    },
  });

  const result = await model.generateContent(params.user);
  const raw = result.response.text();
  if (!raw?.trim()) {
    throw new BusinessReportResponseError(
      "empty_content",
      "Gemini returned no text for the business report.",
    );
  }
  return raw;
}

async function runLlmReport(
  provider: LlmProviderId,
  system: string,
  user: string,
): Promise<GenerateBusinessReportResult> {
  const model = modelForProvider(provider);
  assertProviderReady(provider);

  let raw: string;
  const label =
    provider === "openai"
      ? "OpenAI"
      : provider === "groq"
        ? "Groq"
        : provider === "openrouter"
          ? "OpenRouter"
          : provider === "gemini"
            ? "Gemini"
            : "Ollama";

  switch (provider) {
    case "openai":
      raw = await completeOpenAiCompatibleJson({
        baseURL: "https://api.openai.com/v1",
        apiKey: env.OPENAI_API_KEY!,
        model,
        system,
        user,
      });
      break;
    case "groq":
      raw = await completeOpenAiCompatibleJson({
        baseURL: GROQ_BASE_URL,
        apiKey: env.GROQ_API_KEY!,
        model,
        system,
        user,
      });
      break;
    case "openrouter": {
      const referer =
        env.OPENROUTER_HTTP_REFERER ??
        process.env.NEXT_PUBLIC_APP_URL ??
        "http://localhost:3000";
      raw = await completeOpenAiCompatibleJson({
        baseURL: OPENROUTER_BASE_URL,
        apiKey: env.OPENROUTER_API_KEY!,
        model,
        system,
        user,
        defaultHeaders: {
          "HTTP-Referer": referer,
          "X-Title": "Maple Tariff Disruptors",
        },
      });
      break;
    }
    case "gemini":
      raw = await completeGeminiJson({
        apiKey: env.GEMINI_API_KEY!,
        model,
        system,
        user,
      });
      break;
    case "ollama": {
      const cloudKey = env.OLLAMA_API_KEY;
      if (cloudKey) {
        raw = await completeOpenAiCompatibleJson({
          baseURL: `${OLLAMA_CLOUD_OPENAI_BASE}/v1`,
          apiKey: cloudKey,
          model,
          system,
          user,
        });
      } else {
        const base = envUrlBase(env.OLLAMA_BASE_URL, DEFAULT_OLLAMA_BASE);
        raw = await completeOpenAiCompatibleJson({
          baseURL: `${base}/v1`,
          apiKey: "ollama",
          model,
          system,
          user,
        });
      }
      break;
    }
    default: {
      const _never: never = provider;
      void _never;
      throw new Error("Unsupported LLM provider");
    }
  }

  return parseModelJson(raw, label);
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

  const provider = resolveLlmProvider();
  if (!provider) {
    throw new LlmConfigurationError(
      "No LLM configured. Set LLM_PROVIDER and the matching API key (or LLM_PROVIDER=ollama with Ollama running).",
    );
  }

  const { system, user } = buildPrompts(newsItems, profile);
  return runLlmReport(provider, system, user);
}
