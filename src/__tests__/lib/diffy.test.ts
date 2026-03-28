import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

describe("resolvedDiffyApiUrl", () => {
  beforeEach(() => {
    vi.resetModules();
    process.env.SKIP_ENV_VALIDATION = "1";
    process.env.AUTH_SECRET = "test-auth-secret-for-vitest";
    process.env.DATABASE_URL =
      "postgresql://postgres:postgres@127.0.0.1:5432/vitest_dummy";
    delete process.env.DIFFY_API_URL;
    delete process.env.VERCEL;
    delete process.env.VERCEL_URL;
    delete process.env.NEXT_PUBLIC_APP_URL;
  });

  it("prefers explicit DIFFY_API_URL", async () => {
    process.env.DIFFY_API_URL = "https://explicit.test/feed";
    const { resolvedDiffyApiUrl } = await import("~/lib/diffy");
    expect(resolvedDiffyApiUrl()).toBe("https://explicit.test/feed");
  });

  it("on Vercel uses NEXT_PUBLIC_APP_URL with trailing slash stripped", async () => {
    process.env.VERCEL = "1";
    process.env.NEXT_PUBLIC_APP_URL = "https://my.app/";
    const { resolvedDiffyApiUrl } = await import("~/lib/diffy");
    expect(resolvedDiffyApiUrl()).toBe(
      "https://my.app/api/integrations/diffy-feed",
    );
  });

  it("on Vercel falls back to VERCEL_URL when no public URL", async () => {
    process.env.VERCEL = "1";
    process.env.VERCEL_URL = "proj.vercel.app";
    const { resolvedDiffyApiUrl } = await import("~/lib/diffy");
    expect(resolvedDiffyApiUrl()).toBe(
      "https://proj.vercel.app/api/integrations/diffy-feed",
    );
  });

  it("returns undefined outside Vercel when DIFFY_API_URL is unset", async () => {
    const { resolvedDiffyApiUrl } = await import("~/lib/diffy");
    expect(resolvedDiffyApiUrl()).toBeUndefined();
  });
});

describe("fetchLatestNews", () => {
  beforeEach(() => {
    process.env.DIFFY_API_URL = "https://diffy.example.test/api/news";
    process.env.DIFFY_API_KEY = "sk-diffy-test";
    vi.resetModules();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns normalized articles on 200 with a JSON array", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      statusText: "OK",
      json: async () => [
        {
          title: "Tariff news",
          url: "https://example.com/news/1",
          summary: "Summary text",
          tags: ["steel", "tariffs"],
          publishedAt: "2025-01-01T12:00:00.000Z",
        },
      ],
    });
    vi.stubGlobal("fetch", fetchMock);

    const { fetchLatestNews } = await import("~/lib/diffy");
    const articles = await fetchLatestNews();

    expect(articles).toHaveLength(1);
    expect(articles[0]).toMatchObject({
      title: "Tariff news",
      url: "https://example.com/news/1",
      summary: "Summary text",
    });
    expect(fetchMock).toHaveBeenCalled();
    const call = fetchMock.mock.calls[0];
    expect(call).toBeDefined();
    const url = call![0] as string;
    const init = call![1] as RequestInit;
    expect(url).toBe("https://diffy.example.test/api/news");
    expect(init).toMatchObject({
      method: "GET",
      headers: { Authorization: "Bearer sk-diffy-test" },
    });
  });

  it("throws on non-OK HTTP status", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 502,
      statusText: "Bad Gateway",
      text: async () => "upstream failure",
    });
    vi.stubGlobal("fetch", fetchMock);

    const { fetchLatestNews } = await import("~/lib/diffy");
    await expect(fetchLatestNews()).rejects.toThrow(/Diffy API error: 502/);
  });

  it("returns an empty array when the API responds with 200 and no articles", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      statusText: "OK",
      json: async () => ({ articles: [] }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const { fetchLatestNews } = await import("~/lib/diffy");
    const articles = await fetchLatestNews();
    expect(articles).toEqual([]);
  });
});
