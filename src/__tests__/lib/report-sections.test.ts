import { describe, expect, it } from "vitest";

import { parseReportSections } from "~/lib/report-sections";

describe("parseReportSections", () => {
  it("parses valid JSON-shaped sections", () => {
    const out = parseReportSections({
      whatChanged: "CAD moved.",
      howItAffects: "Costs may rise.",
      whatToDo: ["Call supplier", "Review invoices"],
      disclaimer: "Not advice.",
    });
    expect(out?.whatChanged).toBe("CAD moved.");
    expect(out?.whatToDo).toHaveLength(2);
  });

  it("returns null for invalid input", () => {
    expect(parseReportSections(null)).toBeNull();
    expect(parseReportSections({})).toBeNull();
    expect(parseReportSections({ whatToDo: [] })).toBeNull();
  });
});
