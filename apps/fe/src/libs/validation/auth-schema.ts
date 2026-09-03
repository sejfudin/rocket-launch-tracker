import type { TFunction } from "i18next";
import z from "zod";

import { defaultNS } from "@/config/i18n";
import { UserAuthModels } from "@/openapi/userAuth/userAuth.models";

export namespace AuthSchema {
  export const EmailSchema = (t: TFunction) =>
    z.email(
      t(($) => $.auth.shared.email.invalid, {
        defaultNS,
      }),
    );

  export const PasswordSchema = (t: TFunction) =>
    z
      .string(
        t(($) => $.auth.shared.password.required, {
          defaultNS,
        }),
      )
      .min(
        8,
        t(($) => $.auth.shared.password.weak, {
          defaultNS,
        }),
      );

  export const LoginRequestSchema = (t: TFunction) => {
    return UserAuthModels.UserAuthPasswordLoginRequestSchema.extend({
      email: EmailSchema(t),
      password: PasswordSchema(t),
    });
  };

  export const MagicLinkRequestSchema = (t: TFunction) =>
    UserAuthModels.UserAuthEmailGenerateRequestSchema.extend({ email: EmailSchema(t) });

  export const ForgotPasswordRequestSchema = (t: TFunction) =>
    UserAuthModels.UserAuthEmailGenerateRequestSchema.extend({ email: EmailSchema(t) });

  export const RegisterRequestSchema = (t: TFunction) =>
    UserAuthModels.UserAuthPasswordRegisterRequestSchema.extend({
      name: z.string(
        t(($) => $.auth.shared.name.required, {
          defaultNS,
        }),
      ),

      email: EmailSchema(t),
      password: PasswordSchema(t),
    });

  export const ForgotPasswordConsumeRequestSchema = (t: TFunction) =>
    UserAuthModels.UserAuthForgotPasswordConsumeRequestSchema.extend({ code: z.string(), password: PasswordSchema(t) });
}
