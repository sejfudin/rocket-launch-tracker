import type { SVGProps } from "react";

export const DarkModeIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    className="fill-current"
    {...props}
  >
    <path
      fill="currentColor"
      d="M12 21q-3.775 0-6.387-2.613Q3 15.776 3 12q0-3.45 2.25-5.987T11 3.05a.9.9 0 0 1 .575.088q.25.137.4.362t.162.525a.9.9 0 0 1-.187.575 5.2 5.2 0 0 0-.637 1.375A5.4 5.4 0 0 0 11.1 7.5q0 2.25 1.575 3.825T16.5 12.9q.776 0 1.538-.225t1.362-.625a.96.96 0 0 1 .563-.163q.287.014.512.138a.9.9 0 0 1 .387.375q.138.25.088.6-.35 3.45-2.937 5.725Q15.423 21 12 21"
    />
  </svg>
);
