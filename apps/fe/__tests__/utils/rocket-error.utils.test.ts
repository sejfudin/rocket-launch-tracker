import type { ApplicationException } from "@povio/ui";
import type { TFunction } from "i18next";
import { describe, expect, it } from "vitest";

import translation from "@/assets/locales/en/translation.json";
import { RocketErrorUtils } from "@/utils/rocket-error.utils";

const t = ((selector: ($: typeof translation) => string, options?: { code?: string }) => {
  const message = selector(translation);
  if (options?.code) {
    return message.replace("{{code}}", options.code);
  }
  return message;
}) as TFunction;

const error = (code: string, serverMessage?: string) => {
  return { code, serverMessage } as ApplicationException<string>;
};

describe("getErrorMessage", () => {
  it("maps rocket validation codes", () => {
    expect(RocketErrorUtils.getErrorMessage(error("invalid-height"), t)).toBe("Height must be greater than 0");
    expect(RocketErrorUtils.getErrorMessage(error("invalid-crew-count"), t)).toBe(
      "Space exploration rockets must have exactly 3 crew members",
    );
    expect(RocketErrorUtils.getErrorMessage(error("not-found"), t)).toBe("Rocket not found");
  });

  it("uses the server message when the code is unknown", () => {
    expect(RocketErrorUtils.getErrorMessage(error("bad-request", "Model not found"), t)).toBe("Model not found");
  });

  it("returns a generic message when there is no error", () => {
    expect(RocketErrorUtils.getErrorMessage(null, t)).toBe("An unknown error occurred. Please try again later.");
  });
});
