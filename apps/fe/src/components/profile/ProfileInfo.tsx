import { useTranslation } from "react-i18next";

import type { UserModels } from "@/openapi/user/user.models";

import { ProfileInfoRow } from "./ProfileInfoRow";

interface IProps {
  user: UserModels.UserMeResponse;
}

export const ProfileInfo = ({ user }: IProps) => {
  const { t } = useTranslation();

  return (
    <section className="flex flex-col gap-8">
      <ProfileInfoRow
        label={t(($) => $.profile.fullName)}
        value={user.name ?? ""}
      />
    </section>
  );
};
