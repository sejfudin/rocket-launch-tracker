import type { TFunction } from "i18next";
import { describe, expect, it } from "vitest";

import translation from "@/assets/locales/en/translation.json";
import { RocketSchema } from "@/libs/validation/rocket-schema";
import { RocketModels } from "@/openapi/rocket/rocket.models";

const t = ((selector: ($: typeof translation) => string) => selector(translation)) as TFunction;

const schema = RocketSchema.CreateFormSchema(t);

const base = {
  name: "Falcon",
  launchDatetime: "2027-01-01T12:00:00.000Z",
  weight: 10,
  height: 20,
  passengers: [{ name: "" }],
  crew: ["", "", ""],
};

describe("CreateFormSchema", () => {
  it("requires a passenger name for a commercial rocket", () => {
    const result = schema.safeParse({
      ...base,
      rocketType: RocketModels.RocketType.commercial,
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((issue) => issue.path.join(".") === "passengers.0.name")).toBe(true);
    }
  });

  it("accepts a commercial rocket with one passenger and an empty crew", () => {
    const result = schema.safeParse({
      ...base,
      rocketType: RocketModels.RocketType.commercial,
      passengers: [{ name: "Ada Lovelace" }],
    });

    expect(result.success).toBe(true);
  });

  it("requires all three crew names for space exploration", () => {
    const result = schema.safeParse({
      ...base,
      rocketType: RocketModels.RocketType.space_exploration,
      crew: ["Neil", "", "Buzz"],
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((issue) => issue.path.join(".") === "crew.1")).toBe(true);
    }
  });

  it("accepts a space exploration rocket with three crew members", () => {
    const result = schema.safeParse({
      ...base,
      rocketType: RocketModels.RocketType.space_exploration,
      crew: ["Neil", "Buzz", "Michael"],
    });

    expect(result.success).toBe(true);
  });
});
