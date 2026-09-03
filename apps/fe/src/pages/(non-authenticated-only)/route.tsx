import { AuthGuard } from "@povio/ui/auth";
import { Outlet, createFileRoute } from "@tanstack/react-router";

import { NonAuthLayout } from "@/components/shared/layout/NonAuthLayout";

const NonAuthOnlyLayout = () => {
  return (
    <AuthGuard type="public-only">
      <NonAuthLayout>
        <Outlet />
      </NonAuthLayout>
    </AuthGuard>
  );
};

export const Route = createFileRoute("/(non-authenticated-only)")({
  component: NonAuthOnlyLayout,
});
