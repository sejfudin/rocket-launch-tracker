import type { SVGProps } from "react";

export const GridIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    className="fill-current"
    {...props}
  >
    <path
      fill="#1C1B1F"
      d="M4.308 19.5q-.758 0-1.283-.525a1.75 1.75 0 0 1-.525-1.283V6.308q0-.758.525-1.283T4.308 4.5h15.384q.758 0 1.283.525t.525 1.283v11.384q0 .758-.525 1.283t-1.283.525zM4 11.25h4.336V6H4.309a.3.3 0 0 0-.221.087.3.3 0 0 0-.087.22zm5.836 0h4.328V6H9.836zm5.828 0H20V6.308a.3.3 0 0 0-.087-.221.3.3 0 0 0-.22-.087h-4.03zM8.336 18v-5.25H4v4.942a.3.3 0 0 0 .087.221.3.3 0 0 0 .22.087zm1.5 0h4.328v-5.25H9.836zm5.828 0h4.028a.3.3 0 0 0 .221-.087.3.3 0 0 0 .087-.22V12.75h-4.336z"
    />
  </svg>
);
