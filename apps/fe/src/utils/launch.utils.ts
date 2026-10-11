import { DateTime } from "luxon";

export namespace LaunchUtils {
  export enum LaunchStatus {
    Past = "past",
    Today = "today",
    ThisWeek = "this-week",
    Future = "future",
  }

  export interface Countdown {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  }

  const toDateTime = (launch?: string | null) => {
    if (!launch) {
      return null;
    }

    const dateTime = DateTime.fromISO(launch);
    return dateTime.isValid ? dateTime : null;
  };

  export const getStatus = (launch?: string | null, now: DateTime = DateTime.now()) => {
    const target = toDateTime(launch);
    if (!target) {
      return null;
    }

    const today = now.startOf("day");
    if (target < today) {
      return LaunchStatus.Past;
    }
    if (target < today.plus({ days: 1 })) {
      return LaunchStatus.Today;
    }
    if (target < today.plus({ days: 7 })) {
      return LaunchStatus.ThisWeek;
    }
    return LaunchStatus.Future;
  };

  export const getRelativeTime = (launch?: string | null, now: DateTime = DateTime.now()) => {
    return toDateTime(launch)?.toRelative({ base: now, locale: "en" }) ?? null;
  };

  export const getCountdown = (launch?: string | null, now: DateTime = DateTime.now()): Countdown | null => {
    const target = toDateTime(launch);
    if (!target) {
      return null;
    }

    if (target <= now) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }

    const { days, hours, minutes, seconds } = target.diff(now, ["days", "hours", "minutes", "seconds"]);
    return { days, hours, minutes, seconds: Math.floor(seconds) };
  };

  export const findNearestUpcoming = <T extends { launchDatetime?: string | null }>(
    rockets: T[],
    now: DateTime = DateTime.now(),
  ) => {
    return rockets.reduce<T | null>((nearest, rocket) => {
      const launch = toDateTime(rocket.launchDatetime);
      if (!launch || launch <= now) {
        return nearest;
      }

      const nearestLaunch = toDateTime(nearest?.launchDatetime);
      return !nearestLaunch || launch < nearestLaunch ? rocket : nearest;
    }, null);
  };
}
