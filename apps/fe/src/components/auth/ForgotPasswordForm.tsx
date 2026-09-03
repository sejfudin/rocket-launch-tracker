import { Button, IconButton, TextInput, Typography, useForm, useToast } from "@povio/ui";
import { lazy } from "react";
import type { SubmitHandler } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { ArrowLeftIcon } from "@/assets/icons/general/ArrowLeft";
import type { ErrorState as TypeErrorState } from "@/components/shared/layout/ErrorState";
import { AuthSchema } from "@/libs/validation/auth-schema";
import type { UserAuthModels } from "@/openapi/userAuth/userAuth.models";
import { UserAuthQueries } from "@/openapi/userAuth/userAuth.queries";
import { ErrorUtils } from "@/utils/error.utils";

const ErrorState = lazy<typeof TypeErrorState>(async () => ({
  default: (await import("@/components/shared/layout/ErrorState")).ErrorState,
}));

interface IProps {
  emailHint?: string;
  onSuccess: ({ email }: { email: string }) => void;
}

export const ForgotPasswordForm = ({ emailHint, onSuccess }: IProps) => {
  const { t } = useTranslation();
  const { errorToast } = useToast();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<UserAuthModels.UserAuthEmailGenerateRequest>({
    zodSchema: AuthSchema.ForgotPasswordRequestSchema(t),
    defaultValues: {
      email: emailHint,
    },
  });

  const useForgotPassword = UserAuthQueries.useRequest();

  const onSubmit: SubmitHandler<UserAuthModels.UserAuthEmailGenerateRequest> = async (values) => {
    useForgotPassword?.mutate(
      { data: values },
      {
        onSuccess: () => {
          onSuccess({ email: values.email });
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
      <div className="relative flex flex-col items-start gap-3 self-stretch">
        <IconButton
          label="Back"
          link={{ to: "/login" }}
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
          className="w-full text-text-default-1"
        >
          {t(($) => $.auth.forgotPassword.title)}
        </Typography>

        <Typography
          variant="default"
          size="label-2"
          as="span"
          className="w-full text-text-default-1"
        >
          {t(($) => $.auth.forgotPassword.description)}
        </Typography>
      </div>

      <TextInput
        className="mb-2"
        label={t(($) => $.auth.shared.email.label)}
        placeholder={t(($) => $.auth.shared.email.placeholder)}
        error={errors.email?.message}
        type="email"
        formControl={{ control, name: "email" }}
      />
      <Button
        width="fill"
        type="submit"
        size="m"
        isLoading={useForgotPassword?.isPending}
        className="mt-5"
      >
        {t(($) => $.auth.forgotPassword.submitBtn)}
      </Button>
      {useForgotPassword?.error ? (
        <ErrorState
          error={useForgotPassword?.error}
          message={ErrorUtils.getErrorMessage(useForgotPassword?.error, t)}
          className="mt-3 text-center"
        />
      ) : null}
    </form>
  );
};
