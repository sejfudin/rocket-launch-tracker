import { Typography } from "@povio/ui";
import { clsx } from "clsx";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";

import fallbackImage from "@/assets/images/fallback-image.png";
import {
  type RocketCardVariantProps,
  rocketCard,
  rocketCardImage,
  rocketCardStatus,
} from "@/components/rocket/rocket-card.cva";
import { LaunchUtils } from "@/utils/launch.utils";

export interface RocketCardProps extends RocketCardVariantProps {
  name: string;
  index: number;
  height?: number | null;
  weight?: number | null;
  launchDatetime?: string | null;
  className?: string;
}

interface CardFieldProps {
  label: string;
  align?: "end";
  children: ReactNode;
}

const formatWeight = (weight: number | null | undefined) => {
  if (weight == null) {
    return null;
  }

  return weight.toLocaleString("de-DE");
};

const formatHeight = (height: number | null | undefined) => {
  if (height == null) {
    return null;
  }

  return height.toLocaleString("en-US", { maximumFractionDigits: 1, useGrouping: false });
};

const formatRelativeTime = (value: string | null) => {
  if (!value) {
    return null;
  }

  return value.charAt(0).toUpperCase() + value.slice(1);
};

const CardField = ({ label, align, children }: CardFieldProps) => (
  <div className={clsx("flex min-w-0 flex-col", align === "end" && "items-end text-right")}>
    <Typography
      size="body-4"
      as="span"
      className="text-text-inverted-2 leading-4"
    >
      {label}
    </Typography>
    {children}
  </div>
);

export const RocketCard = ({
  name,
  index,
  height,
  weight,
  launchDatetime,
  variant = "vertical",
  size = "default",
  className,
}: RocketCardProps) => {
  const { t } = useTranslation();
  const status = LaunchUtils.getStatus(launchDatetime);
  const relativeTime = formatRelativeTime(LaunchUtils.getRelativeTime(launchDatetime));
  const weightValue = formatWeight(weight);
  const heightValue = formatHeight(height);
  const statusVariant =
    status === LaunchUtils.LaunchStatus.Today ||
    status === LaunchUtils.LaunchStatus.ThisWeek ||
    status === LaunchUtils.LaunchStatus.Future
      ? status
      : undefined;

  return (
    <article className={clsx(rocketCard({ variant, size }), className)}>
      <div className={rocketCardImage()}>
        <img
          src={fallbackImage}
          alt=""
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-t from-support-default/80 via-support-default/40 to-support-default/20" />
      </div>

      <span className="relative flex size-10 items-center justify-center rounded-full border border-text-inverted-1/40 bg-text-inverted-1/20 text-text-inverted-1">
        <Typography
          size="title-5"
          as="span"
        >
          {index}
        </Typography>
      </span>

      <div className="relative grid grid-cols-2 gap-x-2 gap-y-3">
        <CardField label={t(($) => $.rockets.card.name)}>
          <Typography
            size="title-5"
            variant="prominent-1"
            as="h3"
            className="text-text-inverted-1 leading-6"
          >
            {name}
          </Typography>
        </CardField>

        <CardField
          label={t(($) => $.rockets.card.launchDate)}
          align="end"
        >
          <div className="flex items-center gap-2">
            {statusVariant ? <span className={rocketCardStatus({ status: statusVariant })} /> : null}
            <Typography
              size="title-5"
              variant="prominent-1"
              as="span"
              className="text-text-inverted-1 leading-6"
            >
              {relativeTime}
            </Typography>
          </div>
        </CardField>

        <CardField label={t(($) => $.rockets.card.weight)}>
          <Typography
            size="title-5"
            variant="prominent-1"
            as="span"
            className="text-text-inverted-1 leading-6"
          >
            {weightValue ? t(($) => $.rockets.card.weightUnit, { value: weightValue }) : null}
          </Typography>
        </CardField>

        <CardField
          label={t(($) => $.rockets.card.height)}
          align="end"
        >
          <Typography
            size="title-5"
            variant="prominent-1"
            as="span"
            className="text-text-inverted-1 leading-6"
          >
            {heightValue ? t(($) => $.rockets.card.heightUnit, { value: heightValue }) : null}
          </Typography>
        </CardField>
      </div>
    </article>
  );
};
