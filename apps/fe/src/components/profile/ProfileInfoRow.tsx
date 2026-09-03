import { Typography } from "@povio/ui";

interface IProps {
  label: string;
  value: string;
}

export const ProfileInfoRow = ({ label, value }: IProps) => {
  return (
    <article>
      <Typography
        size="body-3"
        className="mb-4"
      >
        {label}
      </Typography>
      <Typography
        size="body-4"
        variant="prominent-1"
      >
        {value}
      </Typography>
    </article>
  );
};
