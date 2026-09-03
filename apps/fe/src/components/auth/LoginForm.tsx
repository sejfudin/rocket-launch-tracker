import { Button, Link, PasswordInput, TextInput, Typography, useForm, useToast } from "@povio/ui";
import { lazy, useState } from "react";
import type { SubmitHandler } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { SocialLoginButtons } from "@/components/auth/SocialLoginButtons";
import type { ErrorState as TypeErrorState } from "@/components/shared/layout/ErrorState";
import { Separator } from "@/components/shared/layout/Separator";
import { AppConfig } from "@/config/app.config";
import { useAuth } from "@/hooks/useAuth";
import { AuthSchema } from "@/libs/validation/auth-schema";
import type { UserAuthModels } from "@/openapi/userAuth/userAuth.models";
import { UserAuthQueries } from "@/openapi/userAuth/userAuth.queries";
import { ErrorUtils } from "@/utils/error.utils";

const ErrorState = lazy<typeof TypeErrorState>(async () => ({
  default: (await import("@/components/shared/layout/ErrorState")).ErrorState,
}));

export const LoginForm = () => {
  const { t } = useTranslation();
  const { updateTokens } = useAuth();
  const { successToast, errorToast } = useToast();
  const useLogin = UserAuthQueries.useUserAuthLocalPasswordLogin();
  const [lastSubmittedEmail, setLastSubmittedEmail] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<UserAuthModels.UserAuthPasswordLoginRequest>({
    zodSchema: AuthSchema.LoginRequestSchema(t),
  });

  const emailHint = watch("email");

  const onSubmit: SubmitHandler<UserAuthModels.UserAuthPasswordLoginRequest> = async (values) => {
    setLastSubmittedEmail(values.email);
    useLogin.mutate(
      { data: values },
      {
        onSuccess: (data) => {
          successToast?.({ text: t(($) => $.auth.login.successToast) });
          updateTokens?.(data.accessToken, data.refreshToken ?? null);
        },
        onError: (error) => {
          errorToast({ text: ErrorUtils.getErrorMessage(error, t) });
        },
      },
    );
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex w-full max-w-[27.5rem] flex-col gap-8 bg-elevation-fill-default-1"
    >
      <div className="flex flex-col items-start gap-3 self-stretch">
        <Typography
          variant="prominent-1"
          size="title-2"
          as="h2"
          className="w-full text-text-default-1"
        >
          {t(($) => $.auth.login.heading)}
        </Typography>

        <Typography
          variant="default"
          size="label-2"
          as="span"
          className="text-center text-text-default-3"
        >
          {t(($) => $.auth.login.description)}
        </Typography>
      </div>
      <div className="flex flex-col items-start gap-2 self-stretch">
        <TextInput
          className="mb-2"
          label={t(($) => $.auth.shared.email.label)}
          placeholder={t(($) => $.auth.shared.email.placeholder)}
          error={errors.email?.message}
          type="email"
          formControl={{ control, name: "email" }}
        />
        <PasswordInput
          className="mt-6"
          label={t(($) => $.auth.shared.password.label)}
          placeholder={t(($) => $.auth.shared.password.placeholder)}
          error={errors.password?.message}
          formControl={{ control, name: "password" }}
        />
        <div className="flex flex-col items-end gap-1 self-stretch">
          <Link
            to="/forgot-password"
            search={{ emailHint: emailHint || undefined }}
            className="underline decoration-1 underline-offset-2 [text-decoration-skip-ink:none]"
          >
            <Typography
              variant="default"
              size="label-3"
              as="span"
              className="cursor-pointer text-interactive-text-primary-idle"
            >
              {t(($) => $.auth.forgotPassword.link)}
            </Typography>
          </Link>
        </div>
      </div>
      <div className="flex flex-col items-center gap-1 self-stretch">
        <Button
          width="fill"
          size="m"
          type="submit"
          isLoading={useLogin.isPending}
        >
          {t(($) => $.auth.login.submitBtn)}
        </Button>
        {useLogin.error ? (
          <ErrorState
            error={useLogin.error}
            className="mt-3 text-center"
          />
        ) : null}

        {(useLogin.error?.code as ErrorUtils.ErrorCodes) === ErrorUtils.ErrorCodes.NotConfirmed &&
        lastSubmittedEmail ? (
          <div className="mt-3 text-center">
            <Link
              to="/confirm-account"
              search={{ email: lastSubmittedEmail, send: "true" }}
            >
              {t(($) => $.auth.login.confirmAccount)}
            </Link>
          </div>
        ) : null}
      </div>

      <Separator />

      <div className="flex flex-col items-center gap-4">
        {AppConfig.auth.customJWT.enableMagicLink && (
          <Button
            width="fill"
            variant="outlined"
            color="secondary"
            link={{ to: "/auth/magic-link", search: { emailHint: emailHint || undefined } }}
          >
            {t(($) => $.auth.shared.socials.magic)}
          </Button>
        )}
        <SocialLoginButtons />
      </div>

      <div className="flex items-center justify-center gap-0-5">
        <Typography
          variant="default"
          size="label-2"
          as="span"
          className="text-text-default-2"
        >
          {t(($) => $.auth.login.noAccount)}
        </Typography>

        <Link to="/register">
          <Typography
            variant="prominent-1"
            size="label-2"
            as="span"
            className="overflow-hidden overflow-ellipsis text-center text-interactive-text-primary-idle"
          >
            {t(($) => $.auth.login.signUp)}
          </Typography>
        </Link>
      </div>
    </form>
  );
};
