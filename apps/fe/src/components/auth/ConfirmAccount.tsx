/* oxlint-disable eslint/capitalized-comments */

import { Button, TextInput, Typography, useForm } from "@povio/ui";
import type { SubmitHandler } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { z } from "zod";

interface IProps {
  email: string;
  resendOnLoad?: boolean;
}

const schema = z.object({
  email: z.email(),
  code: z.string(),
});

type Schema = z.infer<typeof schema>;

export const ConfirmAccount = ({ email }: IProps) => {
  const { t } = useTranslation();
  const { control, handleSubmit } = useForm({
    zodSchema: schema,
  });

  const onSubmit: SubmitHandler<Omit<Schema, "email">> = async (_values) => {
    throw new Error("Confirm is not yet supported!");
  };

  const onResend = async () => {
    throw new Error("Resend confirmation is not yet supported");
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex w-full flex-col bg-elevation-fill-default-1 p-10"
    >
      <Typography
        as="h2"
        size="title-1"
        variant="prominent-1"
        className="mb-8 text-center"
      >
        {t(($) => $.auth.confirm.title)}
      </Typography>
      <Typography
        size="body-2"
        className="mb-2"
      >
        {email}
      </Typography>
      <TextInput
        label={t(($) => $.auth.confirm.code.label)}
        // error={errors.code?.message}
        formControl={{ control, name: "code" }}
      />
      <Button
        width="fill"
        type="submit"
        // isLoading={useConfirm?.isPending}
        className="mt-5"
      >
        {t(($) => $.auth.confirm.submitBtn)}
      </Button>
      <Button
        width="fill"
        type="button"
        onPress={() => onResend()}
        // isLoading={useResendConfirm?.isPending}
        className="mt-5"
      >
        {t(($) => $.auth.confirm.resend.btn)}
      </Button>
      {/* {useConfirm?.error ? ( */}
      {/*   <ErrorState */}
      {/*     {/* error={useConfirm?.error} */}
      {/*     className="mt-3 text-center" */}
      {/*   /> */}
      {/* ) : null} */}
    </form>
  );
};
