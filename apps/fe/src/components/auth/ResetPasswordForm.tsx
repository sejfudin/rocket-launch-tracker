import { Button, IconButton, PasswordInput, Typography, useForm, useToast } from "@povio/ui";
import { useNavigate } from "@tanstack/react-router";
import { lazy } from "react";
import type { SubmitHandler } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { ArrowLeftIcon } from "@/assets/icons/general/ArrowLeft";
import type { ErrorState as TypeErrorState } from "@/components/shared/layout/ErrorState";
import { UserAuthModels } from "@/openapi/userAuth/userAuth.models";
import { UserAuthQueries } from "@/openapi/userAuth/userAuth.queries";

const ErrorState = lazy<typeof TypeErrorState>(async () => ({
  default: (await import("@/components/shared/layout/ErrorState")).ErrorState,
}));

interface IProps {
  code: string;
}

export const ResetPasswordForm = ({ code }: IProps) => {
  const { t } = useTranslation();

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<UserAuthModels.UserAuthForgotPasswordConsumeRequest>({
    zodSchema: UserAuthModels.UserAuthForgotPasswordConsumeRequestSchema,
    defaultValues: {
      code,
    },
  });

  const navigate = useNavigate();
  const useForgotPassword = UserAuthQueries.useUserAuthForgotPasswordConsume();

  const { successToast } = useToast();

  const onSubmit: SubmitHandler<UserAuthModels.UserAuthForgotPasswordConsumeRequest> = async (values) => {
    useForgotPassword?.mutate(
      { data: values },
      {
        onSuccess: () => {
          successToast({ text: t(($) => $.auth.resetPassword.successToast) });
          navigate({
            to: "/login",
          });
        },
      },
    );
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex w-full max-w-[27.5rem] flex-col gap-8 bg-elevation-fill-default-1"
    >
      <div className="relative flex flex-col items-start gap-3 self-stretch">
        <IconButton
          label="Back"
          link={{ to: "/forgot-password" }}
          icon={ArrowLeftIcon}
          variant="ghost"
          color="primary"
          size="s"
          className="absolute top-[-58px] left-0"
        />

        <Typography
          variant="prominent-1"
          size="title-2"
          as="h2"
          className="self-stretch text-text-default-1"
        >
          {t(($) => $.auth.resetPassword.title)}
        </Typography>

        <Typography
          variant="default"
          size="label-2"
          as="span"
          className="self-stretch text-text-default-3"
        >
          {t(($) => $.auth.resetPassword.description)}
        </Typography>
      </div>
      <div className="flex flex-col items-start gap-3 self-stretch">
        <PasswordInput
          label={t(($) => $.auth.resetPassword.newPassword.label)}
          placeholder={t(($) => $.auth.resetPassword.newPassword.placeholder)}
          error={errors.password?.message}
          formControl={{ control, name: "password" }}
        />
        <div className="flex flex-col items-start gap-1-5 p-0">
          <Typography
            variant="default"
            size="label-3"
            as="span"
            className="w-full text-text-default-3"
          >
            {t(($) => $.auth.resetPassword.passwordRequirements.header)}
          </Typography>

          <Typography
            variant="default"
            size="label-3"
            as="span"
            className="w-full text-text-default-3"
          >
            {t(($) => $.auth.resetPassword.passwordRequirements.minLength)}
          </Typography>

          <Typography
            variant="default"
            size="label-3"
            as="span"
            className="w-full text-text-default-3"
          >
            {t(($) => $.auth.resetPassword.passwordRequirements.oneDigit)}
          </Typography>

          <Typography
            variant="default"
            size="label-3"
            as="span"
            className="w-full text-text-default-3"
          >
            {t(($) => $.auth.resetPassword.passwordRequirements.oneUpperCase)}
          </Typography>
        </div>
      </div>
      <Button
        width="fill"
        isDisabled={!isValid}
        type="submit"
        isLoading={useForgotPassword?.isPending}
      >
        {t(($) => $.auth.resetPassword.submitBtn)}
      </Button>
      {useForgotPassword?.error ? (
        <ErrorState
          error={useForgotPassword?.error}
          className="mt-3 text-center"
        />
      ) : null}
    </form>
  );
};
