import { resources as uiDefaultResources } from "@povio/ui";
import deepMerge from "deepmerge";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import translationEN from "@/assets/locales/en/translation.json";
import translationSL from "@/assets/locales/sl/translation.json";

export const defaultLanguage = "en";
export const defaultNS = "main";
const defaultResources = {
  en: {
    [defaultNS]: translationEN,
  },
  sl: {
    [defaultNS]: translationSL,
  },
} as const;

const uiResources = uiDefaultResources;

export const resources = deepMerge(defaultResources, uiResources);

i18n.use(initReactI18next).init({
  compatibilityJSON: "v4",
  fallbackLng: defaultLanguage,
  resources,
  ns: Object.keys(resources.en),
  defaultNS,
  lng: defaultLanguage,
  returnNull: false,
  interpolation: {
    escapeValue: false,
  },
  react: {
    useSuspense: false,
  },
});
