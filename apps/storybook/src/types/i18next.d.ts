import "i18next";
import type { resources } from "src/config/i18n";

declare module "i18next" {
  interface CustomTypeOptions {
    enableSelector: true;
    returnNull: false;
    defaultNS: never;
    resources: (typeof resources)["en"];
  }
}
