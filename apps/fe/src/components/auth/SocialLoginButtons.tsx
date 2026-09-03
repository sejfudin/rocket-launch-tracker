import { Button } from "@povio/ui";
import { useTranslation } from "react-i18next";

import { GoogleIcon } from "@/assets/icons/social/Google";
import { AppConfig } from "@/config/app.config";

interface IProps {
  className?: string;
}

export const SocialLoginButtons = ({ className }: IProps) => {
  const { t } = useTranslation();

  const handleGoogleLogin = () => {
    window.location.href = AppConfig.auth.googleRedirectUrl;
  };

  return (
    <div className="flex flex-col items-center gap-4 self-stretch">
      <Button
        width="fill"
        onPress={handleGoogleLogin}
        className={className}
        variant="outlined"
        color="secondary"
        icon={GoogleIcon}
      >
        {t(($) => $.auth.shared.socials.google)}
      </Button>
    </div>
  );
};
