import { DateTime } from "luxon";
import { describe, expect, it } from "vitest";

import { LaunchUtils } from "@/utils/launch.utils";

const NOW = DateTime.fromISO("2026-10-02T10:00:00.000Z", { zone: "utc" });

describe("getStatus", () => {
  it("returns status based on launch proximity", () => {
    expect(LaunchUtils.getStatus("2026-10-02T20:50:00.000Z", NOW)).toBe(LaunchUtils.LaunchStatus.Today);
    expect(LaunchUtils.getStatus("2026-10-04T20:50:00.000Z", NOW)).toBe(LaunchUtils.LaunchStatus.ThisWeek);
    expect(LaunchUtils.getStatus("2026-10-05T09:00:00.000Z", NOW)).toBe(LaunchUtils.LaunchStatus.ThisWeek);
    expect(LaunchUtils.getStatus("2026-10-09T20:50:00.000Z", NOW)).toBe(LaunchUtils.LaunchStatus.Future);
    expect(LaunchUtils.getStatus("2026-10-01T20:50:00.000Z", NOW)).toBe(LaunchUtils.LaunchStatus.Past);
  });

  it("returns null for a missing or invalid date", () => {
    expect(LaunchUtils.getStatus(null, NOW)).toBeNull();
    expect(LaunchUtils.getStatus("invalid", NOW)).toBeNull();
  });
});

describe("formatLaunchLabel", () => {
  it("capitalizes the relative time and appends the clock", () => {
    const time = DateTime.fromISO("2026-10-04T20:50:00.000Z");
    expect(LaunchUtils.formatLaunchLabel("2026-10-04T20:50:00.000Z", NOW)).toBe(
      `In 2 days, ${time.toFormat("HH:mm")}\u00a0${time.toFormat("a")}`,
    );
  });
});

describe("formatWeight", () => {
  it("groups thousands with a dot", () => {
    expect(LaunchUtils.formatWeight(15000)).toBe("15.000");
    expect(LaunchUtils.formatWeight(null)).toBeNull();
  });
});

describe("getRelativeTime", () => {
  it("formats upcoming and past launches", () => {
    expect(LaunchUtils.getRelativeTime("2026-10-04T20:50:00.000Z", NOW)).toBe("in 2 days");
    expect(LaunchUtils.getRelativeTime("2026-10-02T07:00:00.000Z", NOW)).toBe("3 hours ago");
  });
});

describe("getCountdown", () => {
  it("splits the remaining time into days, hours, minutes and seconds", () => {
    expect(LaunchUtils.getCountdown("2026-10-04T20:50:30.000Z", NOW)).toStrictEqual({
      days: 2,
      hours: 10,
      minutes: 50,
      seconds: 30,
    });
  });

  it("returns zero when the launch has passed", () => {
    expect(LaunchUtils.getCountdown("2026-10-02T08:00:00.000Z", NOW)).toStrictEqual({
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
    });
  });
});

describe("findNearestUpcoming", () => {
  it("returns the nearest launch in the future", () => {
    const rockets = [
      { id: "past", launchDatetime: "2026-10-01T12:00:00.000Z" },
      { id: "later", launchDatetime: "2026-10-09T20:50:00.000Z" },
      { id: "missing", launchDatetime: null },
      { id: "nearest", launchDatetime: "2026-10-04T20:50:00.000Z" },
    ];

    expect(LaunchUtils.findNearestUpcoming(rockets, NOW)?.id).toBe("nearest");
  });
});
