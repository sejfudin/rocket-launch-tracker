import { useToast } from "@povio/ui";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { z } from "zod";

import { AppConfig } from "@/config/app.config";
import { useAuth } from "@/hooks/useAuth";

const AuthCallbackPage = () => {
  const { t, i18n } = useTranslation();
  const { updateTokens } = useAuth();
  const navigate = useNavigate();
  const { errorToast } = useToast();
  const options = Route.useSearch();

  const {
    customJWT: { enableMagicLink },
  } = AppConfig.auth;

  useEffect(() => {
    switch (options.type) {
      case "login": {
        if (!options.accessToken || !options.refreshToken) {
          errorToast({ text: t(($) => $.auth.errors["code-invalid"]) });
          navigate({ to: "/login", replace: true });
          return;
        }
        const decodedAccessToken = decodeURIComponent(options.accessToken as string);
        const decodedRefreshToken = decodeURIComponent(options.refreshToken as string);
        updateTokens?.(decodedAccessToken, decodedRefreshToken);
        navigate({ to: "/", replace: true });
        return;
      }
      case "reset": {
        if (!options.code) {
          errorToast({ text: t(($) => $.auth.errors["code-invalid"]) });
          navigate({ to: "/forgot-password", replace: true });
          return;
        }
        navigate({ to: "/reset-password", search: { code: options.code }, replace: true });
        return;
      }
      case "error": {
        let errorMessage = t(($) => $.auth.shared.errors.unknownError);
        if (options.code) {
          errorMessage = i18n.exists(`auth.errors.${options.code}`)
            ? t(($) => $.auth.errors[options.code as keyof typeof $.auth.errors])
            : t(($) => $.auth.shared.errors.unknownErrorWithCode, {
                code: options.code,
              });
        }
        errorToast({ text: errorMessage });
        navigate({ to: "/login", replace: true });
        return;
      }
      default: {
        errorToast({ text: t(($) => $.auth.errors["callback-invalid"]) });
        navigate({ to: "/login", replace: true });
        return;
      }
    }
  }, [enableMagicLink, updateTokens, options, navigate, errorToast, t]);

  return null;
};

export const Route = createFileRoute("/(non-authenticated-only)/auth/callback")({
  component: AuthCallbackPage,
  validateSearch: (search: Record<string, unknown>) => {
    const schema = z.union([
      z.object({
        type: z.literal("login"),
        accessToken: z.string().optional(),
        refreshToken: z.string().optional(),
      }),
      z.object({
        type: z.literal("reset"),
        code: z.string().optional(),
      }),
      z.object({
        type: z.literal("error"),
        code: z.string().optional(),
        message: z.string().optional(),
      }),
    ]);
    return schema.parse(search);
  },
});
