import { lazy } from "react";

import type { ErrorState as TypeErrorState } from "@/components/shared/layout/ErrorState";
import { LoadingState } from "@/components/shared/layout/LoadingState";
import { UserQueries } from "@/openapi/user/user.queries";

import { ProfileHeader } from "./ProfileHeader";
import { ProfileInfo } from "./ProfileInfo";
import { ProfileLogoutButton } from "./ProfileLogoutButton";

const ErrorState = lazy<typeof TypeErrorState>(async () => ({
  default: (await import("@/components/shared/layout/ErrorState")).ErrorState,
}));

export const Profile = () => {
  const { data: user, isLoading, error, refetch } = UserQueries.useGet();

  if (isLoading) {
    return <LoadingState />;
  }

  if (error || !user) {
    return (
      <ErrorState
        error={error}
        onRetry={refetch}
      />
    );
  }

  return (
    <div className="bg-elevation-fill-default-1 px-20 py-14">
      <ProfileHeader user={user} />
      <ProfileInfo user={user} />
      <ProfileLogoutButton />
    </div>
  );
};
