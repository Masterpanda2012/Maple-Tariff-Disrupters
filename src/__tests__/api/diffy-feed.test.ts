import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

describe("GET /api/integrations/diffy-feed", () => {
  beforeEach(() => {
    vi.resetModules();
    process.env.SKIP_ENV_VALIDATION = "1";
    process.env.AUTH_SECRET = "test-auth-secret-for-vitest";
    process.env.DATABASE_URL =
      "postgresql://postgres:postgres@127.0.0.1:5432/vitest_dummy";
    process.env.DIFFY_API_KEY = "test-builtin-diffy-key";
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns 401 without Authorization", async () => {
    const { GET } = await import(
      "~/app/api/integrations/diffy-feed/route"
    );
    const res = await GET(
      new Request("http://localhost/api/integrations/diffy-feed"),
    );
    expect(res.status).toBe(401);
  });

  it("returns 401 with wrong bearer token", async () => {
    const { GET } = await import(
      "~/app/api/integrations/diffy-feed/route"
    );
    const res = await GET(
      new Request("http://localhost/api/integrations/diffy-feed", {
        headers: { Authorization: "Bearer wrong" },
      }),
    );
    expect(res.status).toBe(401);
  });

  it("returns JSON articles with valid bearer", async () => {
    const { GET } = await import(
      "~/app/api/integrations/diffy-feed/route"
    );
    const res = await GET(
      new Request("http://localhost/api/integrations/diffy-feed", {
        headers: { Authorization: "Bearer test-builtin-diffy-key" },
      }),
    );
    expect(res.status).toBe(200);
    const data: unknown = await res.json();
    expect(Array.isArray(data)).toBe(true);
    const row = (data as { title?: string; url?: string }[])[0];
    expect(row?.title).toBeTruthy();
    expect(row?.url).toMatch(/^https:\/\//);
  });
});
