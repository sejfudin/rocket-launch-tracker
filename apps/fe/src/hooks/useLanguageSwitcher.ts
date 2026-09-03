import { useLocalStorage } from "@povio/ui";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { z } from "zod";

import { defaultLanguage } from "@/config/i18n";

const LANGUAGE_STORAGE_KEY = "language";
const LANGUAGE_SCHEMA = z.string();

export const useLanguageSwitcher = () => {
  const { t, i18n } = useTranslation();

  const { value, set } = useLocalStorage({
    key: LANGUAGE_STORAGE_KEY,
    schema: LANGUAGE_SCHEMA,
  });

  useEffect(() => {
    if (value) {
      i18n.changeLanguage(value);
    } else {
      i18n.changeLanguage(defaultLanguage);
    }
  }, [value, i18n]);

  const languages = [
    { label: t(($) => $.shared.languages.slovenian), value: "sl" },
    { label: t(($) => $.shared.languages.english), value: "en" },
  ];

  const changeLanguage = (language: string) => {
    set(language);
  };

  return {
    languages,
    changeLanguage,
  };
};
