import type { SVGProps } from "react";

export const MapPinIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    className="fill-current"
    {...props}
  >
    <path
      fill="currentColor"
      fillRule="evenodd"
      d="M12 6.833a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7m-1.5 3.5a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0"
      clipRule="evenodd"
    />

    <path
      fill="currentColor"
      fillRule="evenodd"
      d="m11.445 21.998.555-.832za1 1 0 0 0 1.11 0L12 21.166c.555.832.554.833.555.832l.003-.002.006-.004.02-.013.07-.048q.091-.063.254-.18a26.353 26.353 0 0 0 3.568-3.126c1.915-2.021 4.024-4.973 4.024-8.292a8.5 8.5 0 1 0-17 0c0 3.319 2.11 6.27 4.024 8.292a26.4 26.4 0 0 0 3.568 3.126 16 16 0 0 0 .325.228l.02.013.005.004zM7.404 5.737A6.5 6.5 0 0 1 18.5 10.333c0 2.515-1.64 4.98-3.476 6.916A24.4 24.4 0 0 1 12 19.936q-.237-.178-.549-.424a24 24 0 0 1-2.475-2.263C7.14 15.312 5.5 12.848 5.5 10.333a6.5 6.5 0 0 1 1.904-4.596"
      clipRule="evenodd"
    />
  </svg>
);
