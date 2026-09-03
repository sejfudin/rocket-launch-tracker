import { Button, IconButton, TextInput, Typography, useForm, useToast } from "@povio/ui";
import type { SubmitHandler } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { ArrowLeftIcon } from "@/assets/icons/general/ArrowLeft";
import { SocialLoginButtons } from "@/components/auth/SocialLoginButtons";
import { Separator } from "@/components/shared/layout/Separator";
import { AuthSchema } from "@/libs/validation/auth-schema";
import type { UserAuthModels } from "@/openapi/userAuth/userAuth.models";
import { UserAuthQueries } from "@/openapi/userAuth/userAuth.queries";
import { ErrorUtils } from "@/utils/error.utils";

interface MagicLinkFormProps {
  emailHint?: string;
  onSuccess: ({ email }: { email: string }) => void;
}

export const MagicLinkForm = ({ emailHint, onSuccess }: MagicLinkFormProps) => {
  const { t } = useTranslation();
  const { errorToast } = useToast();

  const {
    control,
    watch,
    handleSubmit,
    formState: { errors },
  } = useForm<UserAuthModels.UserAuthEmailGenerateRequest>({
    zodSchema: AuthSchema.MagicLinkRequestSchema(t),
    defaultValues: {
      email: emailHint,
    },
  });

  const email = watch("email");
  const { refetch, isLoading } = UserAuthQueries.useGenerate(
    { email },
    {
      enabled: false,
    },
  );

  const onSubmit: SubmitHandler<UserAuthModels.UserAuthEmailGenerateRequest> = async () => {
    const { isSuccess, error, isError } = await refetch();
    if (isError) {
      errorToast({ text: ErrorUtils.getErrorMessage(error, t) });
    }
    if (isSuccess) {
      onSuccess({ email });
    }
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
          {t(($) => $.auth.magicLink.head.title)}
        </Typography>

        <Typography
          variant="default"
          size="label-2"
          as="span"
          className="w-full text-text-default-1"
        >
          {t(($) => $.auth.magicLink.head.description)}
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
      <div className="flex flex-col items-center gap-3">
        <Button
          width="fill"
          type="submit"
          size="m"
          isLoading={isLoading}
        >
          {t(($) => $.auth.magicLink.submitBtn)}
        </Button>
        <Typography
          variant="default"
          size="label-3"
          as="span"
          className="text-center text-text-default-3"
        >
          {t(($) => $.auth.magicLink.hint)}
        </Typography>
      </div>

      <Separator />

      <div className="flex flex-col items-center gap-4">
        <Button
          width="fill"
          variant="outlined"
          color="secondary"
          link={{ to: "/login" }}
        >
          {t(($) => $.auth.magicLink.signInWithPassword)}
        </Button>
        <SocialLoginButtons />
      </div>
    </form>
  );
};
