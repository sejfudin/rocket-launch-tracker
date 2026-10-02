import { Typography } from "@povio/ui";
import { useTranslation } from "react-i18next";

import { RocketCard } from "@/components/rocket/RocketCard";
import { ErrorState } from "@/components/shared/layout/ErrorState";
import { LoadingState } from "@/components/shared/layout/LoadingState";
import { useRocketList } from "@/hooks/useRockets";

export const MainHomeContent = () => {
  const { t } = useTranslation();
  const { data, isLoading, isError, error, refetch } = useRocketList();
  const rockets = data?.pages.flatMap((page) => page.items ?? []) ?? [];

  return (
    <div className="flex flex-col items-center gap-8 self-stretch bg-elevation-fill-default-2 px-4 py-24 md:px-8">
      <div className="flex w-full justify-center gap-2 py-4">
        <div className="flex max-w-96 flex-col items-center gap-1-5">
          <Typography
            size="title-4"
            variant="prominent-1"
            className="text-text-default-1 leading-8 tracking-[-0.449px]"
            as="span"
          >
            {t(($) => $.home.content.title)}
          </Typography>

          <Typography
            size="label-1"
            className="text-center text-text-default-2 leading-6 tracking-[-0.312px]"
            as="span"
          >
            {t(($) => $.home.content.description)}
          </Typography>
        </div>
      </div>

      {isLoading ? <LoadingState /> : null}

      {isError ? (
        <ErrorState
          error={error}
          message={t(($) => $.home.content.error.message)}
          onRetry={() => {
            refetch();
          }}
        />
      ) : null}

      {!isLoading && !isError && rockets.length === 0 ? (
        <Typography
          size="label-1"
          className="text-text-default-2"
          as="p"
        >
          {t(($) => $.home.content.noRockets)}
        </Typography>
      ) : null}

      {rockets.length > 0 ? (
        <div className="grid w-full max-w-6xl grid-cols-1 gap-6 lg:grid-cols-3">
          {rockets.map((rocket, index) => (
            <RocketCard
              key={rocket.id}
              index={index + 1}
              name={rocket.name}
              height={rocket.height}
              weight={rocket.weight}
              launchDatetime={rocket.launchDatetime}
              imageUrl={rocket.picture?.url}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
};
