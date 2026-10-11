import { createFileRoute } from "@tanstack/react-router";

import { RocketDetails } from "@/components/rocket/RocketDetails";
import { FullLayout } from "@/components/shared/layout/FullLayout";

const RocketDetailsPage = () => {
  const { rocketId } = Route.useParams();

  return (
    <FullLayout>
      <RocketDetails rocketId={rocketId} />
    </FullLayout>
  );
};

export const Route = createFileRoute("/rockets/$rocketId")({
  component: RocketDetailsPage,
});
