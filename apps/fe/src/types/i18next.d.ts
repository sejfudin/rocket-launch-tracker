import "i18next";

import type { defaultNS, resources } from "@/config/i18n";

declare module "i18next" {
  interface CustomTypeOptions {
    enableSelector: true;
    returnNull: false;
    defaultNS: typeof defaultNS;
    resources: (typeof resources)["en"];
  }
}
