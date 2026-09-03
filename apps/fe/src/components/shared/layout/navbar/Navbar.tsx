import { Button } from "@povio/ui";
import { Link, useLocation } from "@tanstack/react-router";
import clsx from "clsx";
import { useTranslation } from "react-i18next";

import { LogoIcon } from "@/assets/icons/navbar/Logo";
import { useAuth } from "@/hooks/useAuth";

import { NavbarThemeSwitcher } from "./NavbarThemeSwitcher";

export const Navbar = () => {
  const { isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const isHomePage = location.pathname === "/";
  const { t } = useTranslation();

  return (
    <header
      className={clsx(
        "flex items-center justify-between border-b border-b-elevation-outline-default-1 border-solid py-3-5 pr-8",
        isHomePage && "bg-elevation-fill-default-1",
      )}
    >
      <Link
        to="/"
        className="flex items-center gap-2-5 pl-4"
      >
        <LogoIcon
          className="text-text-default-1"
          width={154}
          height={64}
        />
      </Link>

      <div className="flex items-center gap-6">

        <NavbarThemeSwitcher />

        {isAuthenticated ? (
          <Button
            color="primary"
            variant="outlined"
            onPress={() => logout()}
          >
            {t(($) => $.navbar.auth.logout)}
          </Button>
        ) : (
          <Button
            color="primary"
            link={{ to: "/login" }}
          >
            {t(($) => $.navbar.auth.loginToManageRocket)}
          </Button>
        )}
      </div>
    </header>
  );
};
