import { type VariantProps, cva } from "class-variance-authority";

import { LaunchUtils } from "@/utils/launch.utils";

export const rocketCard = cva(
  "relative flex overflow-hidden rounded-m bg-elevation-fill-inverted-1 text-text-inverted-1",
  {
    variants: {
      variant: {
        vertical: "flex-col p-4",
        horizontal: "flex-row items-center",
      },
      size: {
        default: "gap-10 p-4",
        large: "gap-16",
      },
    },
    compoundVariants: [{ variant: "horizontal", size: "large", class: "p-5" }],
    defaultVariants: {
      variant: "vertical",
      size: "default",
    },
  },
);

export const rocketCardFields = cva("relative grid min-w-0 flex-1", {
  variants: {
    variant: {
      vertical: "grid-cols-2 gap-x-2 gap-y-3",
      horizontal: "grid-cols-4 items-start gap-6",
    },
  },
  defaultVariants: {
    variant: "vertical",
  },
});

export const rocketCardImage = "absolute inset-0";

export const rocketCardStatus = cva("size-2 shrink-0 rounded-full", {
  variants: {
    status: {
      [LaunchUtils.LaunchStatus.Today]: "bg-elevation-fill-error-1",
      [LaunchUtils.LaunchStatus.ThisWeek]: "bg-elevation-fill-warning-1",
      [LaunchUtils.LaunchStatus.Future]: "bg-elevation-fill-success-1",
    },
  },
});

export type RocketCardVariantProps = VariantProps<typeof rocketCard>;
