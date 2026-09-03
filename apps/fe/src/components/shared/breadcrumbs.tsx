import { Typography } from "@povio/ui";
import { Link, type LinkProps } from "@tanstack/react-router";
import { clsx } from "clsx";
import { Fragment } from "react";

import { ChevRightIcon } from "@/assets/icons/general/ChevRight";

export interface BreadcrumbItem extends LinkProps {
  label: string;
  active?: boolean;
}

interface BreadcrumbsProps {
  items?: readonly BreadcrumbItem[];
}

export default function Breadcrumbs(props: BreadcrumbsProps = { items: [] }) {
  const crumbs = props.items?.map(({ label, active, ...item }, i) => {
    return (
      <Fragment key={`breadcrumb-${label}`}>
        <div className="flex items-center gap-0-5">
          <div className="flex items-center">
            <Typography
              variant={active ? "prominent-1" : "default"}
              size="label-3"
              as="span"
              className={clsx(active ? "text-text-default-1" : "text-text-default-3")}
            >
              {item.to && item.to !== "." ? (
                <Link
                  key={label}
                  {...item}
                >
                  {label}
                </Link>
              ) : (
                label
              )}
            </Typography>
          </div>
        </div>

        {i < (props.items?.length ?? 0) - 1 && (
          <div className="flex -rotate-90 items-center py-1">
            <div className="flex h-4 w-4 rotate-90 items-center justify-center pt-0-5 pb-1">
              <ChevRightIcon className="text-interactive-contained-primary-idle" />
            </div>
          </div>
        )}
      </Fragment>
    );
  });

  return <div className="flex h-4 items-center gap-0-5">{crumbs}</div>;
}
