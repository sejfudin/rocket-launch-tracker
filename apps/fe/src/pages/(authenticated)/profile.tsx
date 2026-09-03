import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

import { Profile } from "@/components/profile/Profile";
import { AppHead } from "@/components/shared/head/AppHead";
import { ThinPageWrapper } from "@/components/shared/layout/ThinPageWrapper";

const ProfilePage = () => {
  const { t } = useTranslation();

  return (
    <>
      <AppHead
        title={t(($) => $.profile.head.title)}
        description={t(($) => $.profile.head.description)}
      />
      <ThinPageWrapper>
        <Profile />
      </ThinPageWrapper>
    </>
  );
};

export const Route = createFileRoute("/(authenticated)/profile")({
  component: ProfilePage,
});
