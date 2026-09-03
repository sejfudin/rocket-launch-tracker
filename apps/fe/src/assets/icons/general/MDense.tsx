import type { SVGProps } from "react";

export const MDenseIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    className="fill-current"
    {...props}
  >
    <line
      x1="5.25"
      y1="5.5"
      x2="20.25"
      y2="5.5"
      stroke="currentColor"
      strokeLinecap="round"
    />
    <line
      x1="5.25"
      y1="9"
      x2="20.25"
      y2="9"
      stroke="currentColor"
      strokeLinecap="round"
    />
    <line
      x1="5.25"
      y1="13"
      x2="20.25"
      y2="13"
      stroke="currentColor"
      strokeLinecap="round"
    />
    <line
      x1="5.25"
      y1="16.5"
      x2="20.25"
      y2="16.5"
      stroke="currentColor"
      strokeLinecap="round"
    />
  </svg>
);
