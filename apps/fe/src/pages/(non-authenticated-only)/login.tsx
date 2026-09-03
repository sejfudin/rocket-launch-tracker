import { AuthGuard } from "@povio/ui/auth";
import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

import { LoginForm } from "@/components/auth/LoginForm";
import { AppHead } from "@/components/shared/head/AppHead";

const LoginPage = () => {
  const { t } = useTranslation();

  return (
    <>
      <AppHead
        title={t(($) => $.auth.login.head.title)}
        description={t(($) => $.auth.login.head.description)}
      />
      <AuthGuard type="public-only">
        <LoginForm />
      </AuthGuard>
    </>
  );
};

export const Route = createFileRoute("/(non-authenticated-only)/login")({
  component: LoginPage,
});
