import { Link, useTranslationMemo } from "@povio/ui";
import { linkOptions } from "@tanstack/react-router";
import type { TFunction } from "i18next";

import { useAuth } from "@/hooks/useAuth";

import { NavbarAuth } from "./auth/NavbarAuth";

const getLinks = (t: TFunction) =>
  linkOptions([
    {
      to: "/",
      label: t(($) => $.navbar.links.home),
      isPrivate: false,
    },
  ]);

export const NavbarLinks = () => {
  const { isAuthenticated } = useAuth();

  const links = useTranslationMemo(getLinks);

  return (
    <nav className="flex items-center gap-8 text-desktop-body-2">
      {links
        .filter((link) => !link.isPrivate || isAuthenticated)
        .map(({ label, ...props }) => (
          <Link
            key={props.to}
            {...props}
          >
            {label}
          </Link>
        ))}
      <NavbarAuth />
    </nav>
  );
};
