import { AuthGuard } from "@povio/ui/auth";
import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

import { RegisterForm } from "@/components/auth/RegisterForm";
import { AppHead } from "@/components/shared/head/AppHead";

const RegisterPage = () => {
  const { t } = useTranslation();

  return (
    <>
      <AppHead
        title={t(($) => $.auth.register.head.title)}
        description={t(($) => $.auth.register.head.description)}
      />
      <AuthGuard type="public-only">
        <RegisterForm />
      </AuthGuard>
    </>
  );
};

export const Route = createFileRoute("/(non-authenticated-only)/register")({
  component: RegisterPage,
});
