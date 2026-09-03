import { Button, ErrorHandler, Typography } from "@povio/ui";
import { useTranslation } from "react-i18next";

import { ThinPageWrapper } from "@/components/shared/layout/ThinPageWrapper";

export interface ErrorFallbackProps {
  error: unknown;
  resetError: () => void;
}

export const ErrorFallback = ({ error, resetError }: ErrorFallbackProps) => {
  const { t } = useTranslation();

  return (
    <ThinPageWrapper>
      <main className="flex flex-col items-center justify-center gap-2 p-8">
        <Typography
          size="headline-1"
          variant="prominent-1"
          as="h2"
        >
          {t(($) => $.shared.errorFallback.heading)}
        </Typography>
        <Typography
          size="title-2"
          className="text-center text-text-error-1"
        >
          {t(($) => $.shared.errorFallback.subheading, {
            error: ErrorHandler.getErrorMessage(error),
          })}
        </Typography>
        <Button
          width="fill"
          type="button"
          onPress={resetError}
        >
          {t(($) => $.shared.errorFallback.retryBtn)}
        </Button>
      </main>
    </ThinPageWrapper>
  );
};
