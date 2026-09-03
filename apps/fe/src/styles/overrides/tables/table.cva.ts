import { type VariantProps, cva } from "class-variance-authority";

export const tableRow = cva(
  [
    "border-b border-b-elevation-outline-default-1 border-solid",
    "hover:bg-elevation-fill-default-2",
    "disabled:opacity-50",
    "selected:bg-elevation-fill-default-2",
    "hover:selected:bg-interactive-subtle-secondary-hover",
    "data-clickable:cursor-pointer",
    "focus-within:bg-elevation-fill-default-2",
  ],
  {
    variants: {
      alternatingBackground: {
        even: "even:bg-elevation-fill-inverted-4/5",
        odd: "odd:bg-elevation-fill-inverted-4/5",
      },
      rowSize: {
        sm: "h-8",
        md: "h-11",
        lg: "h-14",
      },
    },
    defaultVariants: {
      rowSize: "md",
    },
  },
);

export type TableRowVariantProps = VariantProps<typeof tableRow>;
