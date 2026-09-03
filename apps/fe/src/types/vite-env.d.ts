/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_PUBLIC_ENABLE_WEB_VITALS: "true" | "false";
  readonly VITE_PUBLIC_API_URL: string;
  readonly VITE_PUBLIC_LOG_LEVEL: "error" | "warn";
  readonly VITE_PUBLIC_SENTRY_DSN: string;
  readonly VITE_PUBLIC_SENTRY_ENVIRONMENT: string;
  readonly VITE_PUBLIC_SENTRY_TRACES_SAMPLE_RATE: string;
  readonly VITE_PUBLIC_SENTRY_REPLAYS_ON_ERROR_SAMPLE_RATE: string;
  readonly VITE_PUBLIC_SENTRY_REPLAYS_SESSION_SAMPLE_RATE: string;
  readonly VITE_PUBLIC_GOOGLE_ANALYTICS_MEASUREMENT_ID: string;
  readonly VITE_PUBLIC_AUTH_CUSTOM_JWT_ENABLE_MAGIC_LINK: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
