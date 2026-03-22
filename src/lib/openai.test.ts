import { beforeEach, describe, expect, it, vi } from "vitest";
import type { BusinessProfile, NewsArticle } from "../../generated/prisma";

const hoisted = vi.hoisted(() => ({
  completionsCreate: vi.fn(),
}));

vi.mock("openai", () => ({
  default: class OpenAI {
    constructor(_opts?: { apiKey?: string }) {
      void _opts;
    }
    chat = {
      completions: {
        create: hoisted.completionsCreate,
      },
    };
  },
}));

const profile: BusinessProfile = {
  id: "bp1",
  userId: "u1",
  companyName: "Maple Motors",
  industry: "Automotive",
  suppliers: ["US steel", "Local aluminum"],
  mission: "Build Canadian vehicles",
  description: "Tier-2 parts supplier",
  isVerified: false,
};

const article: NewsArticle = {
  id: "n1",
  title: "Steel tariffs rise",
  url: "https://example.com/news/1",
  summary: "Tariffs on imported steel increased.",
  tags: ["steel", "tariffs"],
  publishedAt: new Date("2025-01-01T12:00:00.000Z"),
  createdAt: new Date("2025-01-01T12:00:00.000Z"),
};

describe("generateBusinessReport", () => {
  beforeEach(() => {
    hoisted.completionsCreate.mockReset();
    hoisted.completionsCreate.mockResolvedValue({
      choices: [
        {
          message: {
            content: JSON.stringify({
              title: "Steel tariffs and your supply chain",
              report:
                "Short-term: lock in domestic quotes. Long-term: diversify suppliers. Sources: Steel tariffs rise (https://example.com/news/1).",
            }),
          },
        },
      ],
    });
  });

  it("returns a fixed message when there are no articles (no OpenAI call)", async () => {
    const { generateBusinessReport } = await import("./openai");
    const out = await generateBusinessReport([], profile);
    expect(out.title).toBe("No matching news yet");
    expect(out.report).toContain("no tagged news articles");
    expect(hoisted.completionsCreate).not.toHaveBeenCalled();
  });

  it("calls OpenAI and returns parsed title and report", async () => {
    vi.resetModules();
    const { generateBusinessReport } = await import("./openai");
    const out = await generateBusinessReport([article], profile);
    expect(out.title).toBe("Steel tariffs and your supply chain");
    expect(out.report).toContain("Short-term");
    expect(hoisted.completionsCreate).toHaveBeenCalledTimes(1);
  });

  it("throws when the model returns invalid JSON", async () => {
    vi.resetModules();
    hoisted.completionsCreate.mockResolvedValueOnce({
      choices: [{ message: { content: "not json" } }],
    });
    const { generateBusinessReport } = await import("./openai");
    await expect(generateBusinessReport([article], profile)).rejects.toThrow(
      "non-JSON",
    );
  });
});
