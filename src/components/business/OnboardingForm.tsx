"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

type Step = 1 | 2 | 3;

type SupplierRow = { id: string; value: string };

export function OnboardingForm() {
  const router = useRouter();
  const supplierIdSeq = useRef(0);
  const [step, setStep] = useState<Step>(1);
  const [companyName, setCompanyName] = useState("");
  const [industry, setIndustry] = useState("");
  const [suppliers, setSuppliers] = useState<SupplierRow[]>([
    { id: "sup-0", value: "" },
  ]);
  const [mission, setMission] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  function addSupplierRow() {
    supplierIdSeq.current += 1;
    const id = `sup-${supplierIdSeq.current}`;
    setSuppliers((s) => [...s, { id, value: "" }]);
  }

  function updateSupplier(id: string, value: string) {
    setSuppliers((s) =>
      s.map((row) => (row.id === id ? { ...row, value } : row)),
    );
  }

  function removeSupplier(id: string) {
    setSuppliers((s) => {
      if (s.length <= 1) {
        supplierIdSeq.current = 0;
        return [{ id: "sup-0", value: "" }];
      }
      return s.filter((row) => row.id !== id);
    });
  }

  function validateStep(current: Step): boolean {
    if (current === 1) {
      if (!companyName.trim() || !industry.trim()) {
        setError("Company name and industry are required.");
        return false;
      }
    }
    if (current === 2) {
      const cleaned = suppliers.map((s) => s.value.trim()).filter(Boolean);
      if (cleaned.length === 0) {
        setError("Add at least one supplier or partner.");
        return false;
      }
    }
    if (current === 3) {
      if (!mission.trim() || !description.trim()) {
        setError("Mission and description are required.");
        return false;
      }
    }
    setError(null);
    return true;
  }

  function goNext() {
    if (!validateStep(step)) return;
    setStep((s) => (s < 3 ? ((s + 1) as Step) : s));
  }

  function goBack() {
    setError(null);
    setStep((s) => (s > 1 ? ((s - 1) as Step) : s));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validateStep(3)) return;
    setPending(true);
    setError(null);
    const supplierList = suppliers.map((s) => s.value.trim()).filter(Boolean);
    try {
      const res = await fetch("/api/business/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName: companyName.trim(),
          industry: industry.trim(),
          suppliers: supplierList,
          mission: mission.trim(),
          description: description.trim(),
        }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }
      router.push("/business/dashboard");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form
      onSubmit={step === 3 ? onSubmit : (e) => e.preventDefault()}
      className="mx-auto flex w-full max-w-lg flex-col gap-6 rounded-xl border border-charcoal/10 bg-white p-6 shadow-sm"
    >
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-xl font-semibold text-charcoal">
          Business onboarding
        </h1>
        <span className="text-sm text-charcoal/60">Step {step} of 3</span>
      </div>

      <div className="flex gap-1" aria-hidden>
        {[1, 2, 3].map((n) => (
          <div
            key={n}
            className={`h-1 flex-1 rounded-full ${
              n <= step ? "bg-maple" : "bg-charcoal/15"
            }`}
          />
        ))}
      </div>

      {step === 1 ? (
        <div className="flex flex-col gap-4">
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-charcoal">Company name</span>
            <input
              required
              className="rounded-lg border border-charcoal/15 px-3 py-2 text-charcoal focus:border-maple focus:outline-none focus:ring-1 focus:ring-maple"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              autoComplete="organization"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-charcoal">Industry</span>
            <input
              required
              className="rounded-lg border border-charcoal/15 px-3 py-2 text-charcoal focus:border-maple focus:outline-none focus:ring-1 focus:ring-maple"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              placeholder="e.g. Automotive manufacturing"
            />
          </label>
        </div>
      ) : null}

      {step === 2 ? (
        <div className="flex flex-col gap-3">
          <p className="text-sm text-charcoal/75">
            List key suppliers or partners your business relies on. These help
            us match relevant economic news to your operations.
          </p>
          {suppliers.map((row, i) => (
            <div key={row.id} className="flex gap-2">
              <input
                className="flex-1 rounded-lg border border-charcoal/15 px-3 py-2 text-sm text-charcoal focus:border-maple focus:outline-none focus:ring-1 focus:ring-maple"
                value={row.value}
                onChange={(e) => updateSupplier(row.id, e.target.value)}
                placeholder={`Supplier ${i + 1}`}
              />
              <button
                type="button"
                onClick={() => removeSupplier(row.id)}
                className="rounded-lg px-2 text-sm text-charcoal/60 hover:bg-charcoal/5 hover:text-charcoal"
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
        </div>
      ) : null}

      {step === 3 ? (
        <div className="flex flex-col gap-4">
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-charcoal">Mission</span>
            <textarea
              required
              rows={3}
              className="rounded-lg border border-charcoal/15 px-3 py-2 text-charcoal focus:border-maple focus:outline-none focus:ring-1 focus:ring-maple"
              value={mission}
              onChange={(e) => setMission(e.target.value)}
              placeholder="What drives your business?"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-charcoal">
              Description (what you do)
            </span>
            <textarea
              required
              rows={4}
              className="rounded-lg border border-charcoal/15 px-3 py-2 text-charcoal focus:border-maple focus:outline-none focus:ring-1 focus:ring-maple"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Products, services, and who you serve."
            />
          </label>
        </div>
      ) : null}

      {error ? (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-charcoal/10 pt-4">
        {step > 1 ? (
          <button
            type="button"
            onClick={goBack}
            disabled={pending}
            className="rounded-lg border border-charcoal/20 px-4 py-2 text-sm font-medium text-charcoal hover:bg-cream disabled:opacity-50"
          >
            Back
          </button>
        ) : (
          <span />
        )}
        {step < 3 ? (
          <button
            type="button"
            onClick={goNext}
            className="rounded-lg bg-maple px-4 py-2 text-sm font-semibold text-white shadow-sm hover:brightness-95"
          >
            Continue
          </button>
        ) : (
          <button
            type="submit"
            disabled={pending}
            className="rounded-lg bg-maple px-4 py-2 text-sm font-semibold text-white shadow-sm hover:brightness-95 disabled:opacity-50"
          >
            {pending ? "Saving…" : "Complete setup"}
          </button>
        )}
      </div>
    </form>
  );
}
