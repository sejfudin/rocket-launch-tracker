import Bowser from "bowser";

export namespace BrowserUtils {
  export interface BrowserInfo {
    browserName: string;
    osName: string;
    platformType: string;
    userAgent: string;
  }

  /**
   * Get friendly browser/device identification string
   * Format: "Chrome on Windows" or "Safari on iPhone OS"
   */
  export const getDeviceIdentifier = (userAgent: string = navigator.userAgent): string => {
    try {
      const parser = Bowser.getParser(userAgent);

      const browserName = parser.getBrowserName() || "Unknown Browser";
      const osName = parser.getOSName() || "Unknown OS";

      // Build friendly name: "Chrome on Windows"
      return `${browserName} on ${osName}`;
    } catch (error) {
      // Fallback to simple detection if Bowser fails
      console.warn("Browser detection failed, using fallback:", error);
      return getDeviceIdentifierFallback(userAgent);
    }
  };

  /**
   * Fallback device identifier using basic parsing
   * Used when Bowser is unavailable or fails
   */
  export const getDeviceIdentifierFallback = (userAgent: string = navigator.userAgent): string => {
    // Simple browser detection
    let browserName = "Browser";
    if (userAgent.includes("Chrome") && !userAgent.includes("Edge")) {
      browserName = "Chrome";
    } else if (userAgent.includes("Firefox")) {
      browserName = "Firefox";
    } else if (userAgent.includes("Safari") && !userAgent.includes("Chrome")) {
      browserName = "Safari";
    } else if (userAgent.includes("Edge")) {
      browserName = "Edge";
    }

    // Simple OS detection
    let os = "Unknown OS";
    if (userAgent.includes("Windows")) {
      os = "Windows";
    } else if (userAgent.includes("Mac")) {
      os = "macOS";
    } else if (userAgent.includes("Linux")) {
      os = "Linux";
    } else if (userAgent.includes("iPhone")) {
      os = "iPhone OS";
    } else if (userAgent.includes("iPad")) {
      os = "iPad OS";
    } else if (userAgent.includes("Android")) {
      os = "Android";
    }

    return `${browserName} on ${os}`;
  };

  /**
   * Get detailed browser information
   */
  export const getBrowserInfo = (userAgent: string = navigator.userAgent): BrowserInfo => {
    try {
      const parser = Bowser.getParser(userAgent);
      return {
        browserName: parser.getBrowserName() || "Unknown",
        osName: parser.getOSName() || "Unknown",
        platformType: parser.getPlatformType() || "Unknown",
        userAgent,
      };
    } catch {
      return {
        browserName: "Unknown",
        osName: "Unknown",
        platformType: "Unknown",
        userAgent,
      };
    }
  };

  /**
   * Check if browser is mobile
   */
  export const isMobile = (userAgent: string = navigator.userAgent): boolean => {
    try {
      const parser = Bowser.getParser(userAgent);
      return parser.getPlatformType() === "mobile";
    } catch {
      return /mobile|android|iphone/i.test(userAgent);
    }
  };

  /**
   * Get device type (desktop, mobile, tablet, etc.)
   */
  export const getDeviceType = (userAgent: string = navigator.userAgent): string => {
    try {
      return Bowser.getParser(userAgent).getPlatformType() || "Unknown";
    } catch {
      if (/tablet|ipad/i.test(userAgent)) {
        return "tablet";
      }
      if (/mobile|android|iphone/i.test(userAgent)) {
        return "mobile";
      }
      return "desktop";
    }
  };
}
