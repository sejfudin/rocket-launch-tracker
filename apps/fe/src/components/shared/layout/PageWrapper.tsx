import clsx from "clsx";
import type React from "react";

interface PageWrapperProps {
  className?: string;
  children: React.ReactNode;
}

export const PageWrapper = ({ className, children }: PageWrapperProps) => {
  return (
    <div className={clsx("flex w-full flex-col items-start gap-3 self-stretch px-5 py-4", className)}>{children}</div>
  );
};
