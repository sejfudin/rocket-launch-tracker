import { AuthGuard } from "@povio/ui/auth";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { z } from "zod";

import { MagicLinkForm } from "@/components/auth/MagicLinkForm";
import { MagicLinkSuccess } from "@/components/auth/MagicLinkSuccess";
import { AppHead } from "@/components/shared/head/AppHead";

const MagicLinkPage = () => {
  const { emailHint } = Route.useSearch();
  const { t } = useTranslation();
  const [successEmail, setSuccessEmail] = useState<string | undefined>(undefined);

  return (
    <>
      <AppHead
        title={t(($) => $.auth.magicLink.head.title)}
        description={t(($) => $.auth.magicLink.head.description)}
      />
      <AuthGuard type="public-only">
        {successEmail ? (
          <MagicLinkSuccess email={successEmail} />
        ) : (
          <MagicLinkForm
            emailHint={emailHint!}
            onSuccess={({ email }) => {
              setSuccessEmail(email);
            }}
          />
        )}
      </AuthGuard>
    </>
  );
};

export const Route = createFileRoute("/(non-authenticated-only)/auth/magic-link/")({
  validateSearch: (search) =>
    z
      .strictObject({
        emailHint: z.string().optional().nullable(),
      })
      .parse(search),
  component: MagicLinkPage,
});
