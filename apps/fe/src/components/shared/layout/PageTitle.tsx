import { Typography } from "@povio/ui";
import type React from "react";
import type { JSX } from "react";

interface PageTitleProps {
  title: string;
  actions: JSX.Element | React.ReactNode;
}

export const PageTitle = ({ title, actions }: PageTitleProps) => {
  return (
    <div className="flex w-full justify-between">
      <Typography
        variant="default"
        size="title-4"
        as="h3"
        className="text-text-default-1"
      >
        {title}
      </Typography>
      {actions}
    </div>
  );
};
