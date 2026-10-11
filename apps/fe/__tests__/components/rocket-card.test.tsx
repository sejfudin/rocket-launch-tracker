import { Settings } from "luxon";
import { renderToStaticMarkup } from "react-dom/server";
import { afterAll, describe, expect, it } from "vitest";

import { RocketCard } from "@/components/rocket/RocketCard";
import "@/config/i18n";

const NOW = Date.parse("2026-10-02T10:00:00.000Z");
const originalNow = Settings.now;

Settings.now = () => NOW;

afterAll(() => {
  Settings.now = originalNow;
});

const renderCard = () =>
  renderToStaticMarkup(
    <RocketCard
      index={1}
      name="Falcon"
      height={35.3}
      weight={15000}
      launchDatetime="2026-10-04T20:50:00.000Z"
    />,
  ).replace(/\sdata-insp-path="[^"]*"/g, "");

describe("RocketCard", () => {
  it("matches the vertical card snapshot", () => {
    expect(renderCard()).toMatchSnapshot();
  });
});
