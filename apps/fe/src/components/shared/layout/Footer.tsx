import { Link, Typography } from "@povio/ui";
import { useTranslation } from "react-i18next";

import { LogoSecondaryIcon } from "@/assets/icons/logo/LogoSecondary";

export const Footer = () => {
  const { t } = useTranslation();

  return (
    <div className="flex w-full flex-col bg-elevation-fill-default-2">
      <div className="mt-2 flex items-center justify-center px-6 pb-16">
        <LogoSecondaryIcon
          width={196}
          height={80}
          className="text-text-default-2"
        />
      </div>
      <div className="px-10">
        <div className="h-px bg-elevation-outline-default-1" />
      </div>
      <div className="flex items-start justify-between gap-8 self-stretch px-10 py-8 max-md:flex-col">
        <div className="flex items-start gap-4 self-center">
          <Link href="/">
            <Typography
              variant="default"
              size="label-2"
              as="span"
              className="text-text-default-1"
            >
              {t(($) => $.footer.links.home)}
            </Typography>
          </Link>

          {/* NOTE: legal information and data protection notice are not ready yet */}

          {/* <Typography variant="default" size="label-2" as="span" className="text-text-default-1">
            {t(($) => $.footer.links.legalInformation)}
          </Typography>
  
          <Typography variant="default" size="label-2" as="span" className="text-text-default-1">
            {t(($) => $.footer.links.dataProtectionNotice)}
          </Typography> */}
        </div>

        <Typography
          variant="prominent-1"
          size="body-4"
          as="p"
          className="text-text-default-3"
        >
          {t(($) => $.footer.copyright, { year: new Date().getFullYear() })}
        </Typography>
      </div>
    </div>
  );
};
