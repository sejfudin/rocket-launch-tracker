import { Button, CheckIcon, IconButton, Typography } from "@povio/ui";
import { useTranslation } from "react-i18next";

import { ArrowLeftIcon } from "@/assets/icons/general/ArrowLeft";

export const MagicLinkSuccess = ({ email }: { email: string }) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center gap-8 bg-elevation-fill-default-1">
      <div className="relative flex flex-col items-start gap-3 self-stretch">
        <IconButton
          label="Back"
          link={{ to: "/login" }}
          icon={ArrowLeftIcon}
          variant="ghost"
          color="primary"
          size="s"
          className="absolute top-[-58px] left-0"
        />

        <Typography
          variant="prominent-1"
          size="title-2"
          as="h2"
          className="w-full text-text-default-1"
        >
          {t(($) => $.auth.magicLink.success.title)}
        </Typography>
      </div>
      <div className="flex flex-col items-center gap-3">
        <CheckIcon className="h-20 w-20 text-elevation-fill-success-1" />
        <Typography
          variant="default"
          size="label-2"
          as="span"
          className="w-full text-center text-text-default-2"
        >
          {t(($) => $.auth.magicLink.success.description, { email })}
        </Typography>
      </div>
      <div className="flex w-full flex-col items-center gap-3">
        <Button
          width="fill"
          size="m"
          link={{ to: "/login" }}
        >
          {t(($) => $.auth.magicLink.success.continueToLogin)}
        </Button>
      </div>
    </div>
  );
};
