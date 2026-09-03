import { useEffect, useState } from "react";

import { BrowserUtils } from "@/utils/browser.utils";

export interface BrowserDetectionState {
  deviceIdentifier: string;
  isLoading: boolean;
  error: Error | null;
}

/**
 * Hook to get browser/device identification
 * Automatically detects current browser on mount
 * Returns format: "Chrome on Windows", "Safari on macOS", etc.
 */
export const useBrowserDetection = (): BrowserDetectionState => {
  const [state, setState] = useState<BrowserDetectionState>({
    deviceIdentifier: "",
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    try {
      const identifier = BrowserUtils.getDeviceIdentifier(navigator.userAgent);
      setState({
        deviceIdentifier: identifier,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      setState({
        deviceIdentifier: "Unknown Device",
        isLoading: false,
        error: error instanceof Error ? error : new Error("Unknown error"),
      });
    }
  }, []);

  return state;
};
