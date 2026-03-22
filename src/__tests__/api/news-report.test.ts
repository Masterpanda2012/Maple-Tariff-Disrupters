import { beforeEach, describe, expect, it, vi } from "vitest";

import { UserRole } from "../../../generated/prisma";
import { POST } from "~/app/api/business/news-report/route";

const hoisted = vi.hoisted(() => ({
  auth: vi.fn(),
  getBusinessProfile: vi.fn(),
  getRelevantNewsForBusiness: vi.fn(),
  saveBusinessReport: vi.fn(),
  generateBusinessReport: vi.fn(),
}));

vi.mock("~/lib/auth", () => ({
  auth: hoisted.auth,
}));

vi.mock("~/lib/actions/business", () => ({
  getBusinessProfile: hoisted.getBusinessProfile,
  getBusinessReports: vi.fn(),
}));

vi.mock("~/lib/actions/news", () => ({
  getRelevantNewsForBusiness: hoisted.getRelevantNewsForBusiness,
  saveBusinessReport: hoisted.saveBusinessReport,
}));

vi.mock("~/lib/openai", () => ({
  generateBusinessReport: hoisted.generateBusinessReport,
}));

describe("POST /api/business/news-report", () => {
  beforeEach(() => {
    hoisted.auth.mockReset();
    hoisted.getBusinessProfile.mockReset();
    hoisted.getRelevantNewsForBusiness.mockReset();
    hoisted.saveBusinessReport.mockReset();
    hoisted.generateBusinessReport.mockReset();
  });

  it("generates a report for an authenticated business user (201)", async () => {
    hoisted.auth.mockResolvedValue({
      user: {
        id: "biz-user-1",
        role: UserRole.BUSINESS,
        username: "mapleco",
        email: "ops@maple.example",
        name: "Maple Co",
      },
    });

    const profile = {
      id: "bp-1",
      userId: "biz-user-1",
      companyName: "Maple Co",
      industry: "Manufacturing",
      suppliers: ["Local steel"],
      mission: "Build local",
      description: "Tier-2 supplier",
      isVerified: false,
    };

    hoisted.getBusinessProfile.mockResolvedValue(profile);
    hoisted.getRelevantNewsForBusiness.mockResolvedValue([]);
    hoisted.generateBusinessReport.mockResolvedValue({
      title: "Tariffs and your supply chain",
      report: "Short-term: review contracts. Long-term: diversify.",
    });
    hoisted.saveBusinessReport.mockResolvedValue({
      id: "report-1",
      businessId: "bp-1",
      reportTitle: "Tariffs and your supply chain",
      reportBody: "Short-term: review contracts. Long-term: diversify.",
      sourceArticleIds: [],
      createdAt: new Date("2025-06-01T12:00:00.000Z"),
    });

    const res = await POST();

    expect(res.status).toBe(201);
    const json = (await res.json()) as {
      report: { reportTitle: string; reportBody: string };
    };
    expect(json.report.reportTitle).toBe("Tariffs and your supply chain");
    expect(json.report.reportBody).toContain("diversify");
    expect(hoisted.generateBusinessReport).toHaveBeenCalled();
    expect(hoisted.saveBusinessReport).toHaveBeenCalledWith(
      "bp-1",
      expect.objectContaining({
        title: "Tariffs and your supply chain",
        report: "Short-term: review contracts. Long-term: diversify.",
        sourceArticleIds: [],
      }),
    );
  });

  it("returns 401 when unauthenticated", async () => {
    hoisted.auth.mockResolvedValue(null);

    const res = await POST();

    expect(res.status).toBe(401);
    expect(hoisted.getBusinessProfile).not.toHaveBeenCalled();
    expect(hoisted.generateBusinessReport).not.toHaveBeenCalled();
  });

  it("returns 403 when the user is a customer", async () => {
    hoisted.auth.mockResolvedValue({
      user: {
        id: "cust-1",
        role: UserRole.CUSTOMER,
        username: "shopper",
        email: "shopper@example.com",
        name: "Shopper",
      },
    });

    const res = await POST();

    expect(res.status).toBe(403);
    expect(hoisted.getBusinessProfile).not.toHaveBeenCalled();
    expect(hoisted.generateBusinessReport).not.toHaveBeenCalled();
  });
});
