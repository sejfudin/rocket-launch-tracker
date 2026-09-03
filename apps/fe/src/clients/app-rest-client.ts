import { AppConfig } from "@/config/app.config";

import { RestClient } from "./rest/rest-client";

export const AppRestClient = new RestClient({
  config: {
    baseURL: AppConfig.api.url,
  },
});
