import type { SVGProps } from "react";
export const PlusIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    className="fill-current"
    {...props}
  >
    <path
      fill="currentColor"
      d="M11.1 19v-6.1H5a.9.9 0 0 1 0-1.8h6.1V5a.9.9 0 0 1 1.8 0v6.1H19l.092.005a.9.9 0 0 1 0 1.79L19 12.9h-6.1V19a.9.9 0 0 1-1.8 0"
    />
  </svg>
);
