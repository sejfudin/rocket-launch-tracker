import { IconButton, Modal, RadioGroup, Tooltip, Typography } from "@povio/ui";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { MapPinIcon } from "@/assets/icons/general/MapPin";
import { useLanguageSwitcher } from "@/hooks/useLanguageSwitcher";

export const NavbarLanguageSwitcher = () => {
  const { t, i18n } = useTranslation();

  const { languages, changeLanguage } = useLanguageSwitcher();

  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      >
        <Typography
          size="title-5"
          variant="prominent-1"
          as="h2"
          className="mb-4"
        >
          {t(($) => $.navbar.languageSwitcher.title)}
        </Typography>

        <RadioGroup
          value={i18n.language}
          label={t(($) => $.navbar.languageSwitcher.label)}
          options={languages}
          onChange={(value) => changeLanguage(value)}
        />
      </Modal>
      <Tooltip text={t(($) => $.navbar.languageSwitcher.open)}>
        <IconButton
          className="ml-2"
          onPress={() => setIsOpen(true)}
          label={t(($) => $.navbar.languageSwitcher.open)}
          icon={MapPinIcon}
        />
      </Tooltip>
    </>
  );
};
