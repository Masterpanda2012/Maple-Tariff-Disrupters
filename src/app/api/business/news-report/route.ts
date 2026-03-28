import { NextResponse } from "next/server";
import { z } from "zod";

import type { Prisma } from "../../../../../generated/prisma";
import { UserRole } from "../../../../../generated/prisma";
import {
  getBusinessProfile,
  getBusinessReports,
} from "~/lib/actions/business";
import {
  getRelevantNewsForBusiness,
  saveBusinessReport,
} from "~/lib/actions/news";
import { generateBusinessReport, LlmConfigurationError } from "~/lib/openai";
import { auth } from "~/lib/auth";

const querySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  pageSize: z.coerce.number().int().min(1).max(100).optional(),
});

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.user.role !== UserRole.BUSINESS) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const profile = await getBusinessProfile(session.user.id);
  if (!profile) {
    return NextResponse.json(
      { error: "Business profile not found" },
      { status: 404 },
    );
  }

  const url = new URL(request.url);
  const parsed = querySchema.safeParse({
    page: url.searchParams.get("page") ?? undefined,
    pageSize: url.searchParams.get("pageSize") ?? undefined,
  });
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid query", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const result = await getBusinessReports(profile.id, {
    page: parsed.data.page,
    pageSize: parsed.data.pageSize,
  });

  return NextResponse.json(result);
}

export async function POST() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.user.role !== UserRole.BUSINESS) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const profile = await getBusinessProfile(session.user.id);
  if (!profile) {
    return NextResponse.json(
      { error: "Business profile not found" },
      { status: 404 },
    );
  }

  try {
    const newsItems = await getRelevantNewsForBusiness(profile);
    const generated = await generateBusinessReport(newsItems, profile);
    const report = await saveBusinessReport(profile.id, {
      title: generated.title,
      report: generated.report,
      sourceArticleIds: newsItems.map((a) => a.id),
      reportSections:
        generated.reportSections as unknown as Prisma.InputJsonValue,
      severity: generated.severity,
    });
    return NextResponse.json({ report }, { status: 201 });
  } catch (e: unknown) {
    console.error("news-report POST:", e);
    const raw = e instanceof Error ? e.message : "Failed to generate business report";
    const message =
      e instanceof LlmConfigurationError
        ? raw
        : raw.includes("OPENAI_API_KEY") ||
            raw.includes("GROQ_API_KEY") ||
            raw.includes("OPENROUTER_API_KEY") ||
            raw.includes("GEMINI_API_KEY") ||
            raw.includes("OLLAMA_API_KEY") ||
            raw.includes("LLM_PROVIDER")
          ? "AI reporting is not configured. Set OPENAI_API_KEY, GROQ_API_KEY, OPENROUTER_API_KEY, or GEMINI_API_KEY (or LLM_PROVIDER=ollama with Ollama running). See .env.example."
          : raw;
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
