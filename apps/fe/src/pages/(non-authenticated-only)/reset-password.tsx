import { AuthGuard } from "@povio/ui/auth";
import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { z } from "zod";

import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";
import { AppHead } from "@/components/shared/head/AppHead";

const ResetPasswordPage = () => {
  const { t } = useTranslation();
  const search = Route.useSearch();
  const { code } = search;

  if (typeof code !== "string" || !code) {
    return null;
  }

  return (
    <>
      <AppHead
        title={t(($) => $.auth.resetPassword.head.title)}
        description={t(($) => $.auth.resetPassword.head.description)}
      />
      <AuthGuard type="public-only">
        <ResetPasswordForm code={code} />
      </AuthGuard>
    </>
  );
};

export const Route = createFileRoute("/(non-authenticated-only)/reset-password")({
  component: ResetPasswordPage,
  validateSearch: (search: Record<string, unknown>) => {
    const schema = z.strictObject({
      code: z.string().optional(),
    });
    return schema.parse(search);
  },
});
