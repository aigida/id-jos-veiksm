import { describe, expect, it } from "vitest";

import { classifyInput } from "@/lib/route-input";

describe("home search routing", () => {
  it("sends an article link to article analysis", () => {
    expect(classifyInput("https://www.delfi.lt/news/daily/lithuania/straipsnis-123")).toEqual({
      kind: "article",
      url: "https://www.delfi.lt/news/daily/lithuania/straipsnis-123",
    });
  });

  it("sends a bare portal domain to portal analysis", () => {
    expect(classifyInput("https://www.delfi.lt/")).toEqual({ kind: "portal", q: "delfi.lt" });
  });

  it("recognises a portal by name", () => {
    expect(classifyInput("Lietuvos rytas")).toEqual({ kind: "portal", q: "lrytas.lt" });
  });

  it("sends other text to topic comparison", () => {
    expect(classifyInput("gynybos finansavimas")).toEqual({ kind: "topic", tema: "gynybos finansavimas" });
  });
});
