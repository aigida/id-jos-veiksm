import { describe, expect, it } from "vitest";

import { quoteAppearsInText } from "@/lib/quote-check";

const SOURCE = "Meras teigė: „Sprendimas buvo neišvengiamas“, – sakė jis. Opozicija   jį pavadino skubotu.";

describe("excerpt verification", () => {
  it("accepts an excerpt that appears verbatim", () => {
    expect(quoteAppearsInText("Sprendimas buvo neišvengiamas", SOURCE)).toBe(true);
  });

  it("ignores typographic quotes and extra spacing", () => {
    expect(quoteAppearsInText('"Opozicija jį pavadino skubotu"', SOURCE)).toBe(true);
  });

  it("rejects an excerpt that is not in the text", () => {
    expect(quoteAppearsInText("Sprendimas buvo puikus", SOURCE)).toBe(false);
  });

  it("accepts fragments joined by an ellipsis only in order", () => {
    expect(quoteAppearsInText("Meras teigė ... pavadino skubotu", SOURCE)).toBe(true);
    expect(quoteAppearsInText("pavadino skubotu ... Meras teigė", SOURCE)).toBe(false);
  });

  it("never verifies very short excerpts", () => {
    expect(quoteAppearsInText("jis", SOURCE)).toBe(false);
  });
});
