"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

const DEBOUNCE_MS = 300;

/**
 * Search field driven by the `search` URL query param. Typing updates the address bar
 * after a short debounce and clears `page` when the search text changes.
 */
export function SearchBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const committed = searchParams.get("search") ?? "";

  const [value, setValue] = useState(committed);
  useEffect(() => {
    setValue(committed);
  }, [committed]);

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );

  const pushSearch = useCallback(
    (raw: string) => {
      const params = new URLSearchParams(searchParams.toString());
      const trimmed = raw.trim();
      if (trimmed) params.set("search", trimmed);
      else params.delete("search");
      params.delete("page");
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname);
    },
    [pathname, router, searchParams],
  );

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <label className="flex w-full max-w-xl flex-col gap-1 text-sm">
      <span className="font-medium text-charcoal">Search products</span>
      <input
        type="search"
        name="search"
        className="rounded-xl border border-charcoal/15 bg-white/80 px-3 py-2.5 text-charcoal shadow-sm transition duration-200 placeholder:text-charcoal/40 hover:border-charcoal/25 focus:border-maple focus:bg-white focus:outline-none focus:ring-2 focus:ring-maple/25"
        placeholder="Search by name or description…"
        value={value}
        autoComplete="off"
        onChange={(e) => {
          const next = e.target.value;
          setValue(next);
          if (timeoutRef.current) clearTimeout(timeoutRef.current);
          timeoutRef.current = setTimeout(() => pushSearch(next), DEBOUNCE_MS);
        }}
      />
    </label>
  );
}
