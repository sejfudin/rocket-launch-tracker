import { AuthGuard } from "@povio/ui/auth";
import { Outlet, createFileRoute } from "@tanstack/react-router";

import { FullLayout } from "@/components/shared/layout/FullLayout";

const AuthLayout = () => {
  return (
    <AuthGuard type="private">
      <FullLayout>
        <Outlet />
      </FullLayout>
    </AuthGuard>
  );
};

export const Route = createFileRoute("/(authenticated)")({
  component: AuthLayout,
});
