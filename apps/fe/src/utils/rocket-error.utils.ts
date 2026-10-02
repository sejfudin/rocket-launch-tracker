import type { ApplicationException } from "@povio/ui";
import type { TFunction } from "i18next";

export namespace RocketErrorUtils {
  export enum ErrorCodes {
    InvalidHeight = "invalid-height",
    InvalidWeight = "invalid-weight",
    InvalidLaunchDatetime = "invalid-launch-datetime",
    InvalidCrew = "invalid-crew",
    InvalidPassengers = "invalid-passengers",
    InvalidCrewCount = "invalid-crew-count",
    NotFound = "not-found",
  }

  export const getErrorMessage = (error: ApplicationException<string> | null, t: TFunction) => {
    if (!error) {
      return t(($) => $.auth.shared.errors.unknownError);
    }

    switch (error.code as ErrorCodes) {
      case ErrorCodes.InvalidHeight: {
        return t(($) => $.rockets.errors.invalidHeight);
      }
      case ErrorCodes.InvalidWeight: {
        return t(($) => $.rockets.errors.invalidWeight);
      }
      case ErrorCodes.InvalidLaunchDatetime: {
        return t(($) => $.rockets.errors.invalidLaunchDatetime);
      }
      case ErrorCodes.InvalidCrew: {
        return t(($) => $.rockets.errors.invalidCrew);
      }
      case ErrorCodes.InvalidPassengers: {
        return t(($) => $.rockets.errors.invalidPassengers);
      }
      case ErrorCodes.InvalidCrewCount: {
        return t(($) => $.rockets.errors.invalidCrewCount);
      }
      case ErrorCodes.NotFound: {
        return t(($) => $.rockets.errors.notFound);
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
