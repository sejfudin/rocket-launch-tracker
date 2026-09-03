import "@povio/ui";
import type { LinkProps } from "@tanstack/react-router";

declare module "@povio/ui" {
  interface LinkNavigationProps extends LinkProps {}
}
