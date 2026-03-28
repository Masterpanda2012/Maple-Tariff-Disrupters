import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

/**
 * Optional URL fields often break deploys when pasted without `https://`, with
 * whitespace, or with a mistaken value. Invalid values become `undefined` so
 * auth and other routes do not 500 during `createEnv`.
 */
function parseOptionalUrl(value) {
  if (value === undefined || value === null) return undefined;
  const s = String(value).trim();
  if (s === "") return undefined;
  const withScheme = /^https?:\/\//i.test(s)
    ? s
    : `https://${s.replace(/^\/+/, "")}`;
  try {
    const u = new URL(withScheme);
    if (u.pathname === "/" && u.search === "" && u.hash === "") {
      return u.origin;
    }
    return u.href;
  } catch {
    return undefined;
  }
}

export const env = createEnv({
  /**
   * Specify your server-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars.
   */
  server: {
    AUTH_SECRET: z.string().min(1),
    /**
     * Canonical origin for Auth.js OAuth callbacks in production (e.g. https://app.vercel.app).
     * Falls back to NEXT_PUBLIC_APP_URL when unset. Set explicitly if the app URL differs from the public URL.
     */
    AUTH_URL: z.string().url().optional(),
    DATABASE_URL: z.string().min(1),
    /**
     * Which backend generates business reports. When unset, the first available credential wins:
     * OpenAI → Groq → OpenRouter → Gemini → Ollama Cloud (OLLAMA_API_KEY); local Ollama needs LLM_PROVIDER=ollama.
     */
    LLM_PROVIDER: z.preprocess((v) => {
      const allowed = new Set([
        "openai",
        "groq",
        "openrouter",
        "gemini",
        "ollama",
      ]);
      if (v === undefined || v === null) return undefined;
      const s = String(v).trim().toLowerCase();
      if (s === "") return undefined;
      return allowed.has(s) ? s : undefined;
    }, z.enum(["openai", "groq", "openrouter", "gemini", "ollama"]).optional()),
    OPENAI_API_KEY: z.string().min(1).optional(),
    OPENAI_MODEL: z.string().optional(),
    /** Groq (OpenAI-compatible). Free tier: console.groq.com */
    GROQ_API_KEY: z.string().min(1).optional(),
    GROQ_MODEL: z.string().optional(),
    /** OpenRouter (OpenAI-compatible). https://openrouter.ai */
    OPENROUTER_API_KEY: z.string().min(1).optional(),
    OPENROUTER_MODEL: z.string().optional(),
    OPENROUTER_HTTP_REFERER: z.string().url().optional(),
    /** Google AI Studio / Gemini API key */
    GEMINI_API_KEY: z.string().min(1).optional(),
    GEMINI_MODEL: z.string().optional(),
    /** Ollama Cloud (ollama.com); OpenAI client uses https://ollama.com/v1 with this as Bearer token */
    OLLAMA_API_KEY: z.string().min(1).optional(),
    /** Local Ollama OpenAI-compatible base when OLLAMA_API_KEY is unset, e.g. http://127.0.0.1:11434 */
    OLLAMA_BASE_URL: z.string().url().optional(),
    OLLAMA_MODEL: z.string().optional(),
    DIFFY_API_KEY: z.string().min(1).optional(),
    /** Optional; on Vercel the built-in feed URL can be derived from `NEXT_PUBLIC_APP_URL`. */
    DIFFY_API_URL: z.string().url().optional(),
    CRON_SECRET: z.string().min(1).optional(),
    /** Google OAuth (optional). When both are set, “Continue with Google” is enabled. */
    GOOGLE_CLIENT_ID: z.string().min(1).optional(),
    GOOGLE_CLIENT_SECRET: z.string().min(1).optional(),
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
  },

  /**
   * Specify your client-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars. To expose them to the client, prefix them with
   * `NEXT_PUBLIC_`.
   */
  client: {
    /** Canonical site URL for absolute links, redirects, and client-side API base (e.g. deployment). */
    NEXT_PUBLIC_APP_URL: z.string().url().optional(),
  },

  /**
   * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
   * middlewares) or client-side so we need to destruct manually.
   */
  runtimeEnv: {
    AUTH_SECRET: process.env.NEXTAUTH_SECRET ?? process.env.AUTH_SECRET,
    AUTH_URL:
      parseOptionalUrl(process.env.AUTH_URL) ??
      parseOptionalUrl(process.env.NEXTAUTH_URL) ??
      parseOptionalUrl(process.env.NEXT_PUBLIC_APP_URL),
    DATABASE_URL: process.env.DATABASE_URL,
    LLM_PROVIDER: process.env.LLM_PROVIDER,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    OPENAI_MODEL: process.env.OPENAI_MODEL,
    GROQ_API_KEY: process.env.GROQ_API_KEY,
    GROQ_MODEL: process.env.GROQ_MODEL,
    OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY,
    OPENROUTER_MODEL: process.env.OPENROUTER_MODEL,
    OPENROUTER_HTTP_REFERER: parseOptionalUrl(process.env.OPENROUTER_HTTP_REFERER),
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    GEMINI_MODEL: process.env.GEMINI_MODEL,
    OLLAMA_API_KEY: process.env.OLLAMA_API_KEY,
    OLLAMA_BASE_URL: parseOptionalUrl(process.env.OLLAMA_BASE_URL),
    OLLAMA_MODEL: process.env.OLLAMA_MODEL,
    DIFFY_API_KEY: process.env.DIFFY_API_KEY,
    DIFFY_API_URL: parseOptionalUrl(process.env.DIFFY_API_URL),
    CRON_SECRET: process.env.CRON_SECRET,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_APP_URL: parseOptionalUrl(process.env.NEXT_PUBLIC_APP_URL),
  },
  /**
   * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially
   * useful for Docker builds.
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  /**
   * Makes it so that empty strings are treated as undefined. `SOME_VAR: z.string()` and
   * `SOME_VAR=''` will throw an error.
   */
  emptyStringAsUndefined: true,
});
