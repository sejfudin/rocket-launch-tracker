import { Typography } from "@povio/ui";
import { DateTime } from "luxon";
import { useTranslation } from "react-i18next";

import { useCountdown } from "@/hooks/useCountdown";

interface LaunchCountdownProps {
  name: string;
  launchDatetime: string;
}

const pad = (value: number) => String(value).padStart(2, "0");

export const LaunchCountdown = ({ name, launchDatetime }: LaunchCountdownProps) => {
  const { t } = useTranslation();
  const countdown = useCountdown(launchDatetime);
  const launch = DateTime.fromISO(launchDatetime);

  if (!countdown || !launch.isValid) {
    return null;
  }

  const units = [
    { value: countdown.days, label: t(($) => $.home.countdown.days) },
    { value: countdown.hours, label: t(($) => $.home.countdown.hour) },
    { value: countdown.minutes, label: t(($) => $.home.countdown.min) },
    { value: countdown.seconds, label: t(($) => $.home.countdown.sec) },
  ];

  return (
    <section className="flex w-full max-w-md flex-col items-center gap-4 rounded-m bg-elevation-fill-default-1 px-8 py-6 text-center shadow-sm">
      <div className="flex flex-col gap-1">
        <Typography
          size="label-1"
          variant="prominent-1"
          as="h2"
          className="text-text-default-1"
        >
          {t(($) => $.home.countdown.nextLaunch, { name })}
        </Typography>
        <Typography
          size="body-4"
          as="p"
          className="text-text-default-2"
        >
          {t(($) => $.home.countdown.at, {
            date: launch.toFormat("dd/MM/yyyy"),
            time: launch.toFormat("HH:mm"),
          })}
        </Typography>
      </div>

      <div className="flex gap-3">
        {units.map((unit) => (
          <div
            key={unit.label}
            className="flex flex-col items-center gap-2"
          >
            <div className="flex size-14 items-center justify-center rounded-m bg-interactive-outlined-primary-outline-disabled">
              <Typography
                size="title-5"
                variant="prominent-1"
                as="span"
                className="text-text-default-1"
              >
                {pad(unit.value)}
              </Typography>
            </div>
            <Typography
              size="body-4"
              as="span"
              className="text-text-default-3 tracking-wide"
            >
              {unit.label}
            </Typography>
          </div>
        ))}
      </div>
    </section>
  );
};
