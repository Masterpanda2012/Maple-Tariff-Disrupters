import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

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
