/** Matches persisted `BusinessNewsReport.reportSections` JSON from the alert engine. */
export type EconomicReportSections = {
  whatChanged: string;
  howItAffects: string;
  whatToDo: string[];
  disclaimer?: string;
};

export function parseReportSections(
  raw: unknown,
): EconomicReportSections | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const o = raw as Record<string, unknown>;
  const whatChanged = o.whatChanged;
  const howItAffects = o.howItAffects;
  const whatToDo = o.whatToDo;
  if (typeof whatChanged !== "string" || typeof howItAffects !== "string")
    return null;
  if (!Array.isArray(whatToDo)) return null;
  const steps = whatToDo.filter((x): x is string => typeof x === "string");
  if (steps.length === 0) return null;
  const disclaimer =
    typeof o.disclaimer === "string" ? o.disclaimer : undefined;
  return { whatChanged, howItAffects, whatToDo: steps, disclaimer };
}

export function severityBadgeClass(severity: string | null | undefined): string {
  const s = severity ?? "";
  if (s === "Act Now") {
    return "bg-red-600 text-white ring-1 ring-red-700/30";
  }
  if (s === "Caution") {
    return "bg-amber-500 text-charcoal ring-1 ring-amber-600/30";
  }
  if (s === "Watch") {
    return "bg-slate-200 text-charcoal ring-1 ring-charcoal/10";
  }
  return "bg-charcoal/10 text-charcoal ring-1 ring-charcoal/15";
}
