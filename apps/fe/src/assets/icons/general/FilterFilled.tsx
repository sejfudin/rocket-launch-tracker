import type { SVGProps } from "react";

export const FilterFilledIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    className="fill-current"
    {...props}
  >
    <path
      fill="currentColor"
      d="M11 20a.97.97 0 0 1-.713-.288A.97.97 0 0 1 10 19v-6L4.2 5.6q-.375-.5-.112-1.05Q4.35 4 5 4h14q.65 0 .913.55.261.55-.113 1.05L14 13v6q0 .424-.287.712A.97.97 0 0 1 13 20z"
    />
  </svg>
);
