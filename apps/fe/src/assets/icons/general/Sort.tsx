import type { SVGProps } from "react";

export const SortIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    className="fill-current"
    {...props}
  >
    <path
      fill="currentColor"
      d="M8 4a1 1 0 0 1 .7.3l3 3a1 1 0 0 1-1.4 1.4L9 7.42V19a1 1 0 1 1-2 0V7.41L5.7 8.7a1 1 0 0 1-1.4-1.4l3-3A1 1 0 0 1 8 4m8 16a1 1 0 0 1-.7-.3l-3-3a1 1 0 1 1 1.4-1.4l1.3 1.29V5a1 1 0 1 1 2 0v11.59l1.3-1.3a1 1 0 0 1 1.4 1.42l-3 3a1 1 0 0 1-.7.29"
    />
  </svg>
);
