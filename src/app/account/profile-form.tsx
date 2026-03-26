"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useState } from "react";

import { Button } from "~/components/ui/Button";

type ApiOk = { ok: true; user: { name: string | null; image: string | null } };
type ApiErr = { error: string; details?: unknown };

export function AccountProfileForm({
  initialName,
  initialImage,
}: {
  initialName: string;
  initialImage: string;
}) {
  const reduce = useReducedMotion();
  const [name, setName] = useState(initialName);
  const [image, setImage] = useState(initialImage);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setMessage(null);
    setError(null);
    try {
      const res = await fetch("/api/account/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim().length > 0 ? name.trim() : null,
          image: image.trim().length > 0 ? image.trim() : null,
        }),
      });
      const json = (await res.json().catch(() => ({}))) as ApiOk & ApiErr;
      if (!res.ok) {
        setError(json.error ?? "Could not update profile.");
        return;
      }
      setMessage("Saved.");
    } catch {
      setError("Could not reach the server. Please try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <motion.form
      onSubmit={onSubmit}
      className="flex flex-col gap-4"
      initial={reduce ? undefined : { opacity: 0, y: 10 }}
      animate={reduce ? undefined : { opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
    >
      <label className="flex flex-col gap-1 text-sm">
        <span className="text-charcoal/80">Display name</span>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          className="rounded-lg border border-charcoal/15 bg-cream/40 px-3 py-2 text-charcoal placeholder:text-charcoal/40 transition focus:border-maple/40 focus:outline-none focus:ring-1 focus:ring-maple/30"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="text-charcoal/80">Avatar URL</span>
        <input
          value={image}
          onChange={(e) => setImage(e.target.value)}
          placeholder="https://…"
          inputMode="url"
          className="rounded-lg border border-charcoal/15 bg-cream/40 px-3 py-2 text-charcoal placeholder:text-charcoal/40 transition focus:border-maple/40 focus:outline-none focus:ring-1 focus:ring-maple/30"
        />
        <span className="text-xs text-charcoal/55">
          Tip: use an https URL (or leave blank to remove).
        </span>
      </label>

      {error ? (
        <p className="rounded-lg border border-red-500/20 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      ) : null}
      {message ? (
        <p className="rounded-lg border border-emerald-500/20 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          {message}
        </p>
      ) : null}

      <div className="flex items-center gap-3 pt-1">
        <Button type="submit" isLoading={pending}>
          Save changes
        </Button>
        <button
          type="button"
          disabled={pending}
          onClick={() => {
            setName(initialName);
            setImage(initialImage);
            setMessage(null);
            setError(null);
          }}
          className="rounded-lg px-3 py-2 text-sm font-semibold text-charcoal/70 transition hover:bg-charcoal/5 disabled:opacity-50"
        >
          Reset
        </button>
      </div>
    </motion.form>
  );
}

