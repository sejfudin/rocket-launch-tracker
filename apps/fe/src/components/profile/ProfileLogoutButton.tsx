import { Button } from "@povio/ui";
import { useTranslation } from "react-i18next";

import { useAuth } from "@/hooks/useAuth";

export const ProfileLogoutButton = () => {
  const { logout } = useAuth();
  const { t } = useTranslation();

  return (
    <div className="mt-10 flex justify-center">
      <Button
        onPress={() => logout()}
        width="hug"
      >
        {t(($) => $.profile.logoutBtn)}
      </Button>
    </div>
  );
};
