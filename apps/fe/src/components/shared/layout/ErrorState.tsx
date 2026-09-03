import { Button, ErrorHandler, Typography } from "@povio/ui";
import { clsx } from "clsx";
import { useTranslation } from "react-i18next";

interface IProps {
  error: unknown;
  onRetry?: () => void;
  message?: string | null;
  className?: string;
}

export const ErrorState = ({ error, onRetry, className, message }: IProps) => {
  const { t } = useTranslation();

  return (
    <div className={clsx("flex flex-col items-center justify-center gap-2 text-center", className)}>
      <Typography
        size="body-1"
        className="text-text-error-1"
      >
        {message ?? ErrorHandler.getErrorMessage(error)}
      </Typography>
      {onRetry && (
        <Button
          type="button"
          onPress={onRetry}
          width="hug"
          color="secondary"
        >
          {t(($) => $.shared.errorState.retryBtn)}
        </Button>
      )}
    </div>
  );
};
