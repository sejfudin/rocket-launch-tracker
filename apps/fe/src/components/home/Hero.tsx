import { Typography } from "@povio/ui";
import { useTranslation } from "react-i18next";

export const Hero = () => {
  const { t } = useTranslation();

  return (
    <div className="flex h-72 justify-center self-stretch">
      <div className="flex w-full max-w-xl flex-col items-center justify-center gap-4">
        <Typography
          variant="default"
          size="label-1"
          as="h1"
          className="w-full text-center text-text-default-1"
        >
          {t(($) => $.home.hero.title)}
        </Typography>

        <Typography
          variant="default"
          size="title-5"
          as="h5"
          className="w-full text-center text-text-default-2"
        >
          {t(($) => $.home.hero.description)}
        </Typography>
      </div>
    </div>
  );
};
