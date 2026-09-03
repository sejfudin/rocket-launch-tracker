import React from "react";

import { AppConfig } from "@/config/app.config";

export async function initA11y() {
  if (typeof window !== "undefined" && !AppConfig.isProduction) {
    const ReactDOM = await import("react-dom");

    // oxlint-disable-next-line import/no-extraneous-dependencies
    const axe = await import("@axe-core/react");

    axe.default(React, ReactDOM, 1000);
  }
}
