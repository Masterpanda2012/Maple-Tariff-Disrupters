"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import type { BusinessProfile } from "../../../generated/prisma";

function suppliersFromJson(s: unknown): string[] {
  if (Array.isArray(s)) {
    const list = s.filter((x): x is string => typeof x === "string");
    return list.length > 0 ? list : [""];
  }
  return [""];
}

function readExposure(
  raw: BusinessProfile["exposureProfile"],
): Record<string, unknown> {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  return raw as Record<string, unknown>;
}

export function EditBusinessProfileForm({
  profile,
}: {
  profile: BusinessProfile;
}) {
  const router = useRouter();
  const exp = useMemo(() => readExposure(profile.exposureProfile), [profile]);

  const [companyName, setCompanyName] = useState(profile.companyName);
  const [industry, setIndustry] = useState(profile.industry);
  const [suppliers, setSuppliers] = useState<string[]>(() =>
    suppliersFromJson(profile.suppliers),
  );
  const [mission, setMission] = useState(profile.mission);
  const [description, setDescription] = useState(profile.description);

  const [province, setProvince] = useState(
    typeof exp.province === "string" ? exp.province : "",
  );
  const [naicsCode, setNaicsCode] = useState(
    typeof exp.naicsCode === "string" ? exp.naicsCode : "",
  );
  const [revenueBand, setRevenueBand] = useState(
    typeof exp.revenueBand === "string" ? exp.revenueBand : "",
  );
  const [primaryCountries, setPrimaryCountries] = useState(
    Array.isArray(exp.primarySupplierCountries)
      ? (exp.primarySupplierCountries as unknown[])
          .filter((x): x is string => typeof x === "string")
          .join(", ")
      : "",
  );
  const [importPct, setImportPct] = useState(
    typeof exp.importInputPercent === "number"
      ? String(exp.importInputPercent)
      : "",
  );
  const [markets, setMarkets] = useState(
    Array.isArray(exp.customerMarkets)
      ? (exp.customerMarkets as unknown[])
          .filter((x): x is string => typeof x === "string")
          .join(", ")
      : typeof exp.customerMarkets === "string"
        ? exp.customerMarkets
        : "",
  );

  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  function addSupplierRow() {
    setSuppliers((s) => [...s, ""]);
  }

  function updateSupplier(i: number, value: string) {
    setSuppliers((s) => s.map((x, j) => (j === i ? value : x)));
  }

  function removeSupplier(i: number) {
    setSuppliers((s) => (s.length <= 1 ? [""] : s.filter((_, j) => j !== i)));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const supplierList = suppliers.map((s) => s.trim()).filter(Boolean);
    const countries = primaryCountries
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const marketList = markets
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const importNum = importPct.trim()
      ? Number.parseInt(importPct, 10)
      : undefined;

    const exposureProfile: Record<string, unknown> = {};
    if (province.trim()) exposureProfile.province = province.trim();
    if (naicsCode.trim()) exposureProfile.naicsCode = naicsCode.trim();
    if (revenueBand.trim()) exposureProfile.revenueBand = revenueBand.trim();
    if (countries.length) exposureProfile.primarySupplierCountries = countries;
    if (marketList.length) exposureProfile.customerMarkets = marketList;
    if (importNum !== undefined && !Number.isNaN(importNum)) {
      exposureProfile.importInputPercent = Math.min(
        100,
        Math.max(0, importNum),
      );
    }

    try {
      const res = await fetch("/api/business/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName: companyName.trim(),
          industry: industry.trim(),
          suppliers: supplierList,
          mission: mission.trim(),
          description: description.trim(),
          exposureProfile:
            Object.keys(exposureProfile).length > 0 ? exposureProfile : null,
        }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Could not save.");
        return;
      }
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="mx-auto flex w-full max-w-2xl animate-fade-in-up flex-col gap-8 rounded-2xl border border-charcoal/10 bg-white p-6 shadow-sm motion-reduce:animate-none sm:p-8"
    >
      <div>
        <h1 className="text-2xl font-semibold text-charcoal">
          Business profile &amp; exposure
        </h1>
        <p className="mt-1 text-sm text-charcoal/70">
          Keep your company story and supply-chain context up to date so
          economic reports stay relevant. You can change this any time.
        </p>
      </div>

      <section className="animate-fade-in-up flex flex-col gap-4 delay-75 motion-reduce:animate-none">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-charcoal/50">
          Company basics
        </h2>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-charcoal">Company name</span>
          <input
            required
            className="rounded-lg border border-charcoal/15 px-3 py-2 text-charcoal focus:border-maple focus:outline-none focus:ring-1 focus:ring-maple"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-charcoal">Industry</span>
          <input
            required
            className="rounded-lg border border-charcoal/15 px-3 py-2 text-charcoal focus:border-maple focus:outline-none focus:ring-1 focus:ring-maple"
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            placeholder="e.g. Automotive parts, Food processing"
          />
        </label>
      </section>

      <section className="animate-fade-in-up flex flex-col gap-3 delay-100 motion-reduce:animate-none">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-charcoal/50">
          Suppliers &amp; partners
        </h2>
        <p className="text-sm text-charcoal/70">
          We match news to these names and to your industry. List regions or
          company types if helpful.
        </p>
        {suppliers.map((s, i) => (
          <div key={i} className="flex gap-2">
            <input
              className="flex-1 rounded-lg border border-charcoal/15 px-3 py-2 text-sm text-charcoal focus:border-maple focus:outline-none focus:ring-1 focus:ring-maple"
              value={s}
              onChange={(e) => updateSupplier(i, e.target.value)}
              placeholder={`Supplier ${i + 1}`}
            />
            <button
              type="button"
              onClick={() => removeSupplier(i)}
              className="rounded-lg px-2 text-sm text-charcoal/60 hover:bg-charcoal/5"
            >
              Remove
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={addSupplierRow}
          className="self-start text-sm font-medium text-maple hover:underline"
        >
          + Add supplier
        </button>
      </section>

      <section className="animate-fade-in-up flex flex-col gap-4 delay-150 motion-reduce:animate-none">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-charcoal/50">
          Story
        </h2>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-charcoal">Mission</span>
          <textarea
            required
            rows={3}
            className="rounded-lg border border-charcoal/15 px-3 py-2 text-charcoal focus:border-maple focus:outline-none focus:ring-1 focus:ring-maple"
            value={mission}
            onChange={(e) => setMission(e.target.value)}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-charcoal">What you do</span>
          <textarea
            required
            rows={4}
            className="rounded-lg border border-charcoal/15 px-3 py-2 text-charcoal focus:border-maple focus:outline-none focus:ring-1 focus:ring-maple"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </label>
      </section>

      <section className="animate-fade-in-up flex flex-col gap-4 delay-200 motion-reduce:animate-none">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-charcoal/50">
          Economic exposure (optional)
        </h2>
        <p className="text-sm text-charcoal/70">
          Used to improve alert relevance. All fields are optional.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-charcoal">Region / province</span>
            <input
              className="rounded-lg border border-charcoal/15 px-3 py-2 text-charcoal focus:border-maple focus:outline-none focus:ring-1 focus:ring-maple"
              value={province}
              onChange={(e) => setProvince(e.target.value)}
              placeholder="e.g. Ontario, Bavaria"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-charcoal">Industry code (NAICS)</span>
            <input
              className="rounded-lg border border-charcoal/15 px-3 py-2 text-charcoal focus:border-maple focus:outline-none focus:ring-1 focus:ring-maple"
              value={naicsCode}
              onChange={(e) => setNaicsCode(e.target.value)}
              placeholder="e.g. 332"
            />
          </label>
        </div>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-charcoal">Annual revenue band</span>
          <select
            className="rounded-lg border border-charcoal/15 px-3 py-2 text-charcoal focus:border-maple focus:outline-none focus:ring-1 focus:ring-maple"
            value={revenueBand}
            onChange={(e) => setRevenueBand(e.target.value)}
          >
            <option value="">Select…</option>
            <option value="under_250k">Under $250k</option>
            <option value="250k_1m">$250k – $1M</option>
            <option value="1m_5m">$1M – $5M</option>
            <option value="5m_plus">$5M+</option>
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-charcoal">
            Primary supplier countries (comma-separated)
          </span>
          <input
            className="rounded-lg border border-charcoal/15 px-3 py-2 text-charcoal focus:border-maple focus:outline-none focus:ring-1 focus:ring-maple"
            value={primaryCountries}
            onChange={(e) => setPrimaryCountries(e.target.value)}
            placeholder="United States, China, Germany"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-charcoal">
            Approx. share of inputs imported (%)
          </span>
          <input
            inputMode="numeric"
            className="rounded-lg border border-charcoal/15 px-3 py-2 text-charcoal focus:border-maple focus:outline-none focus:ring-1 focus:ring-maple"
            value={importPct}
            onChange={(e) => setImportPct(e.target.value)}
            placeholder="0–100"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-charcoal">
            Customer markets (comma-separated)
          </span>
          <input
            className="rounded-lg border border-charcoal/15 px-3 py-2 text-charcoal focus:border-maple focus:outline-none focus:ring-1 focus:ring-maple"
            value={markets}
            onChange={(e) => setMarkets(e.target.value)}
            placeholder="Canada, USA, EU"
          />
        </label>
      </section>

      {error ? (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-charcoal/10 pt-4">
        <p className="text-xs text-charcoal/55">
          Saving updates how future AI reports interpret your risk — not past
          PDFs.
        </p>
        <button
          type="submit"
          disabled={pending}
          className="rounded-xl bg-maple px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-maple/20 transition hover:brightness-105 disabled:opacity-50"
        >
          {pending ? "Saving…" : "Save changes"}
        </button>
      </div>
    </form>
  );
}
