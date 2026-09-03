import { Button, Link, PasswordInput, TextInput, Typography, useForm, useToast } from "@povio/ui";
import { lazy } from "react";
import type { SubmitHandler } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { SocialLoginButtons } from "@/components/auth/SocialLoginButtons";
import type { ErrorState as TypeErrorState } from "@/components/shared/layout/ErrorState";
import { Separator } from "@/components/shared/layout/Separator";
import { useAuth } from "@/hooks/useAuth";
import { AuthSchema } from "@/libs/validation/auth-schema";
import type { UserAuthModels } from "@/openapi/userAuth/userAuth.models";
import { UserAuthQueries } from "@/openapi/userAuth/userAuth.queries";

const ErrorState = lazy<typeof TypeErrorState>(async () => ({
  default: (await import("@/components/shared/layout/ErrorState")).ErrorState,
}));

export const RegisterForm = () => {
  const { t } = useTranslation();
  const { updateTokens } = useAuth();

  const {
    watch,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<UserAuthModels.UserAuthPasswordRegisterRequest>({
    zodSchema: AuthSchema.RegisterRequestSchema(t),
  });

  const { successToast } = useToast();

  const useRegister = UserAuthQueries.useRegister();

  const onSubmit: SubmitHandler<UserAuthModels.UserAuthPasswordRegisterRequest> = async (values) => {
    useRegister?.mutate(
      { data: values },
      {
        onSuccess: (result) => {
          successToast({ text: t(($) => $.auth.register.successToast) });

          if (!result) {
            return;
          }
          updateTokens?.(result.accessToken, result.refreshToken ?? null);
        },
      },
    );
  };

  console.log(watch("password"));

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex w-full max-w-[27.5rem] flex-col gap-8 bg-elevation-fill-default-1"
    >
      <div className="flex flex-col items-start gap-[0.75rem] self-stretch">
        <Typography
          variant="prominent-1"
          size="title-2"
          as="h2"
          className="w-full text-text-default-1"
        >
          {t(($) => $.auth.register.title)}
        </Typography>

        <Typography
          variant="default"
          size="label-2"
          as="span"
          className="text-center text-text-default-1"
        >
          {t(($) => $.auth.register.description)}
        </Typography>
      </div>
      <div className="flex flex-col items-start gap-2 self-stretch">
        <TextInput
          label={t(($) => $.auth.shared.name.label)}
          placeholder={t(($) => $.auth.shared.name.placeholder)}
          error={errors.name?.message}
          formControl={{ control, name: "name" }}
        />
        <TextInput
          className="mt-4"
          label={t(($) => $.auth.shared.email.label)}
          placeholder={t(($) => $.auth.shared.email.placeholder)}
          error={errors.email?.message}
          type="email"
          formControl={{ control, name: "email" }}
        />
        <PasswordInput
          className="mt-4"
          label={t(($) => $.auth.shared.password.label)}
          placeholder={t(($) => $.auth.shared.password.placeholder)}
          error={errors.password?.message}
          formControl={{ control, name: "password" }}
        />
        <div className="flex w-[27.5rem] flex-col items-start gap-1-5 p-0">
          <Typography
            variant="default"
            size="label-3"
            as="span"
            className="w-full text-text-default-3"
          >
            {t(($) => $.auth.register.passwordRequirements.header)}
          </Typography>

          <Typography
            variant="default"
            size="label-3"
            as="span"
            className="w-full text-text-default-3"
          >
            {t(($) => $.auth.register.passwordRequirements.minLength)}
          </Typography>

          <Typography
            variant="default"
            size="label-3"
            as="span"
            className="w-full text-text-default-3"
          >
            {t(($) => $.auth.register.passwordRequirements.oneDigit)}
          </Typography>

          <Typography
            variant="default"
            size="label-3"
            as="span"
            className="w-full text-text-default-3"
          >
            {t(($) => $.auth.register.passwordRequirements.oneUpperCase)}
          </Typography>
        </div>
      </div>
      <div className="flex flex-col items-center gap-1 self-stretch">
        <Button
          width="fill"
          type="submit"
          size="m"
          isLoading={useRegister?.isPending}
          className="mt-5"
        >
          {t(($) => $.auth.register.submitBtn)}
        </Button>
        {useRegister?.error ? (
          <ErrorState
            error={useRegister?.error}
            className="mt-3 text-center"
          />
        ) : null}
      </div>

      <Separator />
      <SocialLoginButtons />
      <div className="flex items-center justify-center gap-0-5">
        <Typography
          variant="default"
          size="label-2"
          as="span"
          className="text-text-default-2"
        >
          {t(($) => $.auth.register.alreadyHaveAccount)}
        </Typography>

        <Link to="/login">
          <Typography
            variant="prominent-1"
            size="label-2"
            as="span"
            className="overflow-hidden overflow-ellipsis text-center text-interactive-text-primary-idle"
          >
            {t(($) => $.auth.register.logInWithEmail)}
          </Typography>
        </Link>
      </div>
    </form>
  );
};
