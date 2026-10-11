import { describe, expect, it } from "vitest";

import { rocketCard, rocketCardFields } from "@/components/rocket/rocket-card.cva";

describe("rocketCard", () => {
  it("stacks vertical cards and lays horizontal cards in a row", () => {
    expect(rocketCard({ variant: "vertical", size: "default" })).toContain("flex-col");
    expect(rocketCard({ variant: "horizontal", size: "default" })).toContain("flex-row");
    expect(rocketCardFields({ variant: "vertical" })).toContain("grid-cols-2");
    expect(rocketCardFields({ variant: "horizontal" })).toContain("grid-cols-4");
  });

  it("uses p-5 only when the card is horizontal and large", () => {
    expect(rocketCard({ variant: "horizontal", size: "large" })).toContain("p-5");
    expect(rocketCard({ variant: "horizontal", size: "large" })).not.toContain("p-4");
    expect(rocketCard({ variant: "horizontal", size: "default" })).toContain("p-4");
    expect(rocketCard({ variant: "vertical", size: "default" })).toContain("p-4");
    expect(rocketCard({ variant: "vertical", size: "large" })).toContain("p-4");
    expect(rocketCard({ variant: "vertical", size: "large" })).not.toContain("p-5");
  });
});
