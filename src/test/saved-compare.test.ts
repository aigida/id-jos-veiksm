import { describe, expect, it } from "vitest";

import type { ArticleAnalysis } from "@/lib/analysis.schema";
import { parseIdList } from "@/lib/id-list";
import { compareSaved, similarPhrases } from "@/lib/saved-compare";

function analysis(p: Partial<ArticleAnalysis>): ArticleAnalysis {
  return {
    sufficient_data: true,
    main_idea: "",
    topic: "",
    headline: { fit: "atitinka", explanation: "" },
    actors: [],
    emphases: [],
    language: { tone: "neutralus", summary: "", examples: [] },
    statements: [],
    missing_perspectives: [],
    additional_sources: [],
    follow_up_questions: [],
    limitations: [],
    ...p,
  };
}

const A = {
  id: "a",
  title: "A",
  portal: "DELFI",
  analysis: analysis({
    topic: "Gynybos finansavimo didinimas",
    actors: [
      { name: "Gitanas Nausėda", role: "prezidentas", source_type: "politikas", excerpt: null },
      { name: "Krašto apsaugos ministerija", role: "", source_type: "valdžios institucija", excerpt: null },
    ],
    missing_perspectives: [{ perspective: "Savivaldybių atstovų nuomonė", reason: "Nekalbinti" }],
  }),
};
const B = {
  id: "b",
  title: "B",
  portal: "LRT",
  analysis: analysis({
    topic: "Gynybos finansavimas biudžete",
    language: { tone: "emociškai įkrautas", summary: "", examples: [] },
    actors: [{ name: "„Gitanas Nausėda“", role: "šalies vadovas", source_type: "politikas", excerpt: null }],
    missing_perspectives: [{ perspective: "Savivaldybių nuomonė", reason: "Nėra" }],
  }),
};

describe("saved analyses comparison", () => {
  it("treats an actor quoted in two analyses as shared", () => {
    const c = compareSaved([A, B]);
    expect(c.sharedActors.map((a) => [a.name, a.itemIds])).toEqual([["Gitanas Nausėda", ["a", "b"]]]);
  });

  it("counts source types per analysis", () => {
    const c = compareSaved([A, B]);
    expect(c.sources.find((s) => s.id === "a")?.counts["politikas"]).toBe(1);
    expect(c.sourceTotals.find((s) => s.label === "politikas")?.count).toBe(2);
  });

  it("groups similarly worded topics and missing perspectives", () => {
    const c = compareSaved([A, B]);
    expect(c.sharedTopics[0]?.itemIds).toEqual(["a", "b"]);
    expect(c.recurringPerspectives).toHaveLength(1);
  });

  it("does not match unrelated phrases", () => {
    expect(similarPhrases("Gynybos finansavimas", "Švietimo reforma mokyklose")).toBe(false);
  });
});

describe("compare selection in the address", () => {
  it("keeps only unique well-formed ids", () => {
    const id = "123e4567-e89b-12d3-a456-426614174000";
    expect(parseIdList(`${id},bad,${id}`)).toEqual([id]);
    expect(parseIdList(undefined)).toEqual([]);
  });
});
