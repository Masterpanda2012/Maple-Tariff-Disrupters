import { NextResponse } from "next/server";
import { z } from "zod";

import { UserRole } from "../../../../../generated/prisma";
import {
  getBusinessProfile,
  getBusinessReports,
} from "~/lib/actions/business";
import {
  getRelevantNewsForBusiness,
  saveBusinessReport,
} from "~/lib/actions/news";
import { generateBusinessReport } from "~/lib/openai";
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
    });
    return NextResponse.json({ report }, { status: 201 });
  } catch (e: unknown) {
    console.error("news-report POST:", e);
    const message =
      e instanceof Error ? e.message : "Failed to generate business report";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
