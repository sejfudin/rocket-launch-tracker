import { Typography } from "@povio/ui";

interface EmptyTableStateProps {
  title: string;
  description?: string;
}

export const EmptyTableState = ({ title, description }: EmptyTableStateProps) => {
  return (
    <div className="flex flex-col items-center gap-4 py-12">
      <Typography
        variant="prominent-1"
        size="title-3"
        as="h3"
        className="text-text-default-1"
      >
        {title}
      </Typography>
      {description && (
        <Typography
          className="text-text-default-2"
          variant="default"
          size="body-2"
          as="p"
        >
          {description}
        </Typography>
      )}
    </div>
  );
};
