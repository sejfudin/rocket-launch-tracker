import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { z } from "zod";

import { ConfirmAccount } from "@/components/auth/ConfirmAccount";
import { AppHead } from "@/components/shared/head/AppHead";
import { ThinPageWrapper } from "@/components/shared/layout/ThinPageWrapper";

const ConfirmAccountPage = () => {
  const { t } = useTranslation();
  const search = Route.useSearch();
  const { email, send } = search;

  if (typeof email !== "string") {
    return null;
  }

  return (
    <>
      <AppHead
        title={t(($) => $.auth.confirm.head.title)}
        description={t(($) => $.auth.confirm.head.description)}
      />
      <ThinPageWrapper>
        <ConfirmAccount
          email={email}
          // oxlint-disable-next-line eslint/eqeqeq
          resendOnLoad={send != null}
        />
      </ThinPageWrapper>
    </>
  );
};

export const Route = createFileRoute("/(non-authenticated-only)/confirm-account")({
  component: ConfirmAccountPage,
  validateSearch: (search: Record<string, unknown>) => {
    const schema = z.strictObject({
      email: z.string().optional(),
      send: z.string().optional(),
    });
    return schema.parse(search);
  },
});
