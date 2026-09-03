import type { PropsWithChildren } from "react";

export const ThinPageWrapper = ({ children }: PropsWithChildren) => {
  return <div className="mx-auto my-10 w-full max-w-md">{children}</div>;
};
