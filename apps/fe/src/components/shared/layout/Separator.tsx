import { Typography } from "@povio/ui";
import { useTranslation } from "react-i18next";

interface SeparatorProps {
  showLabel?: boolean;
}

export const Separator = ({ showLabel = true }: SeparatorProps) => {
  const { t } = useTranslation();

  if (!showLabel) {
    return <div className="h-px w-full bg-elevation-outline-default-1" />;
  }

  return (
    <div className="flex flex-row items-center justify-between gap-8 self-stretch">
      <div className="h-px flex-1 bg-elevation-outline-default-1" />

      <Typography
        variant="prominent-1"
        size="label-3"
        as="span"
        className="text-text-default-3"
      >
        {t(($) => $.auth.shared.separator.or)}
      </Typography>

      <div className="h-px flex-1 bg-elevation-outline-default-1" />
    </div>
  );
};
