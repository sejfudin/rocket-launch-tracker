import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { z } from "zod";

import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";
import { AppHead } from "@/components/shared/head/AppHead";
import { ThinPageWrapper } from "@/components/shared/layout/ThinPageWrapper";

const ForgotPasswordCallbackPage = () => {
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
      <ThinPageWrapper>
        <ResetPasswordForm code={code} />
      </ThinPageWrapper>
    </>
  );
};

export const Route = createFileRoute("/(non-authenticated-only)/auth/forgot-password/callback")({
  component: ForgotPasswordCallbackPage,
  validateSearch: (search: Record<string, unknown>) => {
    const schema = z.strictObject({
      code: z.string().optional(),
    });
    return schema.parse(search);
  },
});
