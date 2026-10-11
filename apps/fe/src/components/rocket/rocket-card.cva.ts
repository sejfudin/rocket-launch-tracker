import { type VariantProps, cva } from "class-variance-authority";

import { LaunchUtils } from "@/utils/launch.utils";

export const rocketCard = cva(
  "relative flex flex-col overflow-hidden rounded-m bg-elevation-fill-inverted-1 text-text-inverted-1",
  {
    variants: {
      variant: {
        vertical: "",
        horizontal: "",
      },
      size: {
        default: "gap-10",
        large: "gap-16",
      },
    },
    compoundVariants: [
      { variant: "horizontal", size: "large", class: "p-5" },
      { variant: "horizontal", size: "default", class: "p-4" },
      { variant: "vertical", size: "default", class: "p-4" },
      { variant: "vertical", size: "large", class: "p-4" },
    ],
    defaultVariants: {
      variant: "vertical",
      size: "default",
    },
  },
);

export const rocketCardImage = cva("absolute inset-0");

export const rocketCardStatus = cva("size-2 shrink-0 rounded-full", {
  variants: {
    status: {
      [LaunchUtils.LaunchStatus.Today]: "bg-interactive-contained-error-idle",
      [LaunchUtils.LaunchStatus.ThisWeek]: "bg-interactive-contained-warning-idle",
      [LaunchUtils.LaunchStatus.Future]: "bg-interactive-contained-success-idle",
    },
  },
});

export type RocketCardVariantProps = VariantProps<typeof rocketCard>;
export type RocketCardStatusProps = VariantProps<typeof rocketCardStatus>;
