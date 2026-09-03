const authCustomJWT = {
  enableMagicLink: import.meta.env.VITE_PUBLIC_AUTH_CUSTOM_JWT_ENABLE_MAGIC_LINK === "true",
};

export const AppConfig = {
  isProduction: import.meta.env.NODE_ENV === "production",
  enableWebVitals: import.meta.env.VITE_PUBLIC_ENABLE_WEB_VITALS === "true",
  api: {
    url: import.meta.env.VITE_PUBLIC_API_URL,
  },
  log: {
    level: import.meta.env.VITE_PUBLIC_LOG_LEVEL ?? "error",
  },
  sentry: {
    enabled: import.meta.env.NODE_ENV === "production",
    dsn: import.meta.env.VITE_PUBLIC_SENTRY_DSN,
    environment: import.meta.env.VITE_PUBLIC_SENTRY_ENVIRONMENT,
    tracesSampleRate: parseFloat(import.meta.env.VITE_PUBLIC_SENTRY_TRACES_SAMPLE_RATE ?? "1.0"),
    replaysSessionSampleRate: parseFloat(import.meta.env.VITE_PUBLIC_SENTRY_REPLAYS_SESSION_SAMPLE_RATE ?? "0.1"),
    replaysOnErrorSampleRate: parseFloat(import.meta.env.VITE_PUBLIC_SENTRY_REPLAYS_ON_ERROR_SAMPLE_RATE ?? "1.0"),
  },
  auth: {
    customJWT: authCustomJWT,
    googleRedirectUrl: `${import.meta.env.VITE_PUBLIC_API_URL!}api/user/auth/google`,
  },
  googleAnalytics: {
    measurementId: import.meta.env.VITE_PUBLIC_GOOGLE_ANALYTICS_MEASUREMENT_ID,
  },
};
