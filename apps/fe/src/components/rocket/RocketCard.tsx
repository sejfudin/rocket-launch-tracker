import { Typography } from "@povio/ui";
import { clsx } from "clsx";
import { useTranslation } from "react-i18next";

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
  imageUrl?: string | null;
  className?: string;
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

  return height.toLocaleString("de-DE");
};

export const RocketCard = ({
  name,
  index,
  height,
  weight,
  launchDatetime,
  imageUrl,
  variant = "vertical",
  size = "default",
  className,
}: RocketCardProps) => {
  const { t } = useTranslation();
  const status = LaunchUtils.getStatus(launchDatetime);
  const relativeTime = LaunchUtils.getRelativeTime(launchDatetime);
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
      <div className={rocketCardImage({ variant, size })}>
        {imageUrl ? (
          <img
            src={imageUrl}
            alt=""
            className="h-full w-full object-cover"
          />
        ) : null}
        <span className="absolute top-2 left-2 flex size-7 items-center justify-center rounded-full bg-elevation-fill-default-1 text-text-default-1">
          <Typography
            size="label-2"
            as="span"
          >
            {index}
          </Typography>
        </span>
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <Typography
          size="title-5"
          variant="prominent-1"
          as="h3"
          className="text-text-inverted-1"
        >
          {name}
        </Typography>

        <div className="flex flex-col gap-1">
          <Typography
            size="body-4"
            as="span"
            className="text-text-inverted-2"
          >
            {t(($) => $.rockets.card.launchDate)}
          </Typography>
          <div className="flex items-center gap-2">
            {statusVariant ? <span className={rocketCardStatus({ status: statusVariant })} /> : null}
            <Typography
              size="label-2"
              as="span"
              className="text-text-inverted-1"
            >
              {relativeTime}
            </Typography>
          </div>
        </div>

        <div className="flex gap-6">
          <div className="flex flex-col gap-1">
            <Typography
              size="body-4"
              as="span"
              className="text-text-inverted-2"
            >
              {t(($) => $.rockets.card.weight)}
            </Typography>
            <Typography
              size="label-2"
              as="span"
              className="text-text-inverted-1"
            >
              {weightValue ? t(($) => $.rockets.card.weightUnit, { value: weightValue }) : null}
            </Typography>
          </div>
          <div className="flex flex-col gap-1">
            <Typography
              size="body-4"
              as="span"
              className="text-text-inverted-2"
            >
              {t(($) => $.rockets.card.height)}
            </Typography>
            <Typography
              size="label-2"
              as="span"
              className="text-text-inverted-1"
            >
              {heightValue ? t(($) => $.rockets.card.heightUnit, { value: heightValue }) : null}
            </Typography>
          </div>
        </div>
      </div>
    </article>
  );
};
