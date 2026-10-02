import { type VariantProps, cva } from "class-variance-authority";

import { LaunchUtils } from "@/utils/launch.utils";

export const rocketCard = cva("flex overflow-hidden rounded-m bg-elevation-fill-inverted-1 text-text-inverted-1", {
  variants: {
    variant: {
      vertical: "flex-col",
      horizontal: "flex-row",
    },
    size: {
      default: "gap-3",
      large: "gap-4",
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
});

export const rocketCardImage = cva("relative shrink-0 overflow-hidden rounded-m bg-elevation-fill-inverted-2", {
  variants: {
    variant: {
      vertical: "",
      horizontal: "",
    },
    size: {
      default: "",
      large: "",
    },
  },
  compoundVariants: [
    { variant: "vertical", size: "default", class: "h-40 w-full" },
    { variant: "vertical", size: "large", class: "h-52 w-full" },
    { variant: "horizontal", size: "default", class: "w-36 self-stretch" },
    { variant: "horizontal", size: "large", class: "w-48 self-stretch" },
  ],
  defaultVariants: {
    variant: "vertical",
    size: "default",
  },
});

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
