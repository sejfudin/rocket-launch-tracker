import type { ApplicationException } from "@povio/ui";
import type { TFunction } from "i18next";

export namespace ErrorUtils {
  export enum ErrorCodes {
    InvalidCredentials = "invalid-credentials",
    LocalAuthnIdentityExists = "identity-already-exists",
    NotConfirmed = "identity-not-confirmed",
    IdentityNotFound = "identity-not-found",
  }

  export const getErrorMessage = (error: ApplicationException<string> | null, t: TFunction) => {
    if (!error) {
      return t(($) => $.auth.shared.errors.unknownError);
    }

    switch (error?.code as ErrorCodes) {
      case ErrorCodes.InvalidCredentials: {
        return t(($) => $.auth.shared.errors.invalidCredentials);
      }
      case ErrorCodes.LocalAuthnIdentityExists: {
        return t(($) => $.auth.shared.errors.userAlreadyExists);
      }
      case ErrorCodes.IdentityNotFound: {
        return t(($) => $.auth.shared.errors.identityNotFound);
      }
      default: {
        if (error.serverMessage) {
          return error.serverMessage;
        }
        if (error.code) {
          return t(($) => $.auth.shared.errors.unknownErrorWithCode, {
            code: error.code,
          });
        }
        return t(($) => $.auth.shared.errors.unknownError);
      }
    }
  };
}
