import { Typography } from "@povio/ui";

import type { UserModels } from "@/openapi/user/user.models";

interface IProps {
  user: UserModels.UserMeResponse;
}

export const ProfileHeader = ({ user }: IProps) => {
  return (
    <section className="mb-10 flex items-center gap-7">
      <div>
        <Typography
          size="title-1"
          variant="prominent-1"
          className="mb-1-5"
        >
          {user.name}
        </Typography>
      </div>
    </section>
  );
};
