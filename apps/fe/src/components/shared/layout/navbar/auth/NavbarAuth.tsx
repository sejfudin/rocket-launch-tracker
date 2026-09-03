import { Link, Typography } from "@povio/ui";
import { Link as TanstackLink } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

import { useAuth } from "@/hooks/useAuth";

export const NavbarAuth = () => {
  const { user } = useAuth();

  const { t } = useTranslation();

  if (user) {
    return (
      <TanstackLink
        className="flex items-center gap-5"
        to="/profile"
      >
        <Typography size="body-2">{user.name}</Typography>
      </TanstackLink>
    );
  }

  return (
    <div className="flex items-center gap-8">
      <Link to="/login">{t(($) => $.navbar.auth.login)}</Link>
      <Link to="/register">{t(($) => $.navbar.auth.register)}</Link>
    </div>
  );
};
