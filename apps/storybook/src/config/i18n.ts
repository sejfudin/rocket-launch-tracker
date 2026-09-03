import { ns as uiNs, resources as uiResources } from "@povio/ui";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

export const ns = uiNs;
export const defaultLanguage = "en";

export const resources = uiResources;

i18n.use(initReactI18next).init({
  compatibilityJSON: "v4",
  fallbackLng: defaultLanguage,
  resources,
  ns: [ns],
  defaultNS: ns,
  lng: defaultLanguage,
  returnNull: false,
  interpolation: {
    escapeValue: false,
  },
  react: {
    useSuspense: false,
  },
});

export default i18n;
