import type { SVGProps } from "react";
export const AlertIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 20 20"
    className="fill-current"
    {...props}
  >
    <g
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.667}
      clipPath="url(#alert_svg__a)"
    >
      <path
        stroke="currentColor"
        d="M10 18.333a8.333 8.333 0 1 0 0-16.666 8.333 8.333 0 0 0 0 16.666"
      />
      <path
        stroke="#F5880B"
        d="M10 6.667V10M10 13.333h.008"
      />
    </g>
    <defs>
      <clipPath id="alert_svg__a">
        <path
          fill="currentColor"
          d="M0 0h20v20H0z"
        />
      </clipPath>
    </defs>
  </svg>
);
