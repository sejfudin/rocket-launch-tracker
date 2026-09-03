import { Typography } from "@povio/ui";
import { useTranslation } from "react-i18next";

export const MainHomeContent = () => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center gap-8 self-stretch bg-elevation-fill-default-2 px-0 py-24">
      {/* TODO: Implement main home content */}
      <div className="flex w-full justify-center gap-2 px-0 py-4">
        <div className="flex max-w-96 flex-col items-center gap-1-5">
          <Typography
            size="title-4"
            variant="prominent-1"
            className="text-text-default-1 leading-8 tracking-[-0.449px]"
            as="span"
          >
            {t(($) => $.home.content.title)}
          </Typography>

          <Typography
            size="label-1"
            className="text-center text-text-default-2 leading-6 tracking-[-0.312px]"
            as="span"
          >
            {t(($) => $.home.content.description)}
          </Typography>
        </div>
      </div>
    </div>
  );
};
