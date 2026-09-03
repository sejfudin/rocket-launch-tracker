import log from "loglevel";

import { AppConfig } from "@/config/app.config";

export function initLogger() {
  log.setLevel(AppConfig.log.level as log.LogLevelDesc);
}
