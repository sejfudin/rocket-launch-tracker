import { AuthGuard } from "@povio/ui/auth";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { z } from "zod";

import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";
import { ForgotPasswordSuccess } from "@/components/auth/ForgotPasswordSuccess";
import { AppHead } from "@/components/shared/head/AppHead";

const ForgotPasswordPage = () => {
  const { t } = useTranslation();
  const search = Route.useSearch();
  const { emailHint } = search;
  const [successEmail, setSuccessEmail] = useState<string | undefined>(undefined);

  return (
    <>
      <AppHead
        title={t(($) => $.auth.forgotPassword.head.title)}
        description={t(($) => $.auth.forgotPassword.head.description)}
      />
      <AuthGuard type="public-only">
        {successEmail ? (
          <ForgotPasswordSuccess email={successEmail} />
        ) : (
          <ForgotPasswordForm
            emailHint={emailHint as string}
            onSuccess={({ email }) => setSuccessEmail(email)}
          />
        )}
      </AuthGuard>
    </>
  );
};

export const Route = createFileRoute("/(non-authenticated-only)/forgot-password")({
  component: ForgotPasswordPage,
  validateSearch: (search: Record<string, unknown>) => {
    const schema = z.strictObject({
      emailHint: z.string().optional().nullable(),
    });
    return schema.parse(search);
  },
});
