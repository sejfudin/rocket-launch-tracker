import { Button, Typography } from "@povio/ui";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { RocketSearch } from "@/components/home/RocketSearch";
import { CreateRocketModal } from "@/components/rocket/CreateRocketModal";
import { LaunchCountdown } from "@/components/rocket/LaunchCountdown";
import { RocketCard } from "@/components/rocket/RocketCard";
import { ErrorState } from "@/components/shared/layout/ErrorState";
import { LoadingState } from "@/components/shared/layout/LoadingState";
import { useAuth } from "@/hooks/useAuth";
import { useRocketList } from "@/hooks/useRockets";
import { LaunchUtils } from "@/utils/launch.utils";

export const MainHomeContent = () => {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const [search, setSearch] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const { data, isLoading, isError, error, refetch, hasNextPage, isFetchingNextPage, fetchNextPage } = useRocketList(
    search || undefined,
  );
  const rockets = data?.pages.flatMap((page) => page.items ?? []) ?? [];
  const totalRockets = data?.pages[0]?.totalItems ?? rockets.length;
  const nearestLaunch = LaunchUtils.findNearestUpcoming(rockets);

  return (
    <div className="flex flex-col">
      <section className="flex flex-col items-center gap-6 bg-elevation-fill-default-1 px-4 py-16 md:px-8">
        <Typography
          size="title-4"
          variant="prominent-1"
          className="text-text-default-1"
          as="h1"
        >
          {t(($) => $.home.hero.title)}
        </Typography>

        <RocketSearch onSearch={setSearch} />

        <Typography
          size="label-2"
          className="max-w-md text-center text-text-default-2"
          as="p"
        >
          {t(($) => $.home.hero.description)}
        </Typography>
      </section>

      <section className="flex flex-col items-center gap-8 bg-elevation-fill-default-2 px-4 py-16 md:px-8">
        <div className="flex w-full max-w-6xl flex-col items-center gap-2">
          {isAuthenticated ? (
            <div className="flex w-full justify-end">
              <Button
                width="hug"
                onPress={() => setIsCreateOpen(true)}
              >
                {t(($) => $.rockets.addNewRocket)}
              </Button>
            </div>
          ) : null}

          <Typography
            size="title-4"
            variant="prominent-1"
            className="text-text-default-1"
            as="h2"
          >
            {t(($) => $.home.content.title)}
          </Typography>
          <Typography
            size="label-2"
            className="text-center text-text-default-2"
            as="p"
          >
            {t(($) => $.home.content.description)}
          </Typography>
        </div>

        <CreateRocketModal
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
        />

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
              <Link
                key={rocket.id}
                to="/rockets/$rocketId"
                params={{ rocketId: rocket.id }}
                className="block rounded-m focus-visible:outline-2 focus-visible:outline-interactive-contained-primary-idle focus-visible:outline-offset-2"
              >
                <RocketCard
                  index={index + 1}
                  name={rocket.name}
                  height={rocket.height}
                  weight={rocket.weight}
                  launchDatetime={rocket.launchDatetime}
                />
              </Link>
            ))}
          </div>
        ) : null}

        {rockets.length > 0 ? (
          <Typography
            size="label-2"
            className="text-text-default-2"
            as="p"
          >
            {t(($) => $.home.content.showing, { showingCount: rockets.length, totalRockets })}
          </Typography>
        ) : null}

        {hasNextPage ? (
          <Button
            color="secondary"
            variant="outlined"
            width="hug"
            isDisabled={isFetchingNextPage}
            onPress={() => {
              fetchNextPage();
            }}
          >
            {t(($) => $.home.content.loadMore)}
          </Button>
        ) : null}
      </section>

      {nearestLaunch?.launchDatetime ? (
        <section className="flex flex-col items-center gap-6 bg-elevation-fill-default-1 px-4 py-16 text-center md:px-8">
          <div className="flex flex-col items-center gap-2">
            <Typography
              size="title-4"
              variant="prominent-1"
              className="text-text-default-1"
              as="h2"
            >
              {t(($) => $.home.countdown.sectionTitle)}
            </Typography>
            <Typography
              size="label-2"
              className="text-text-default-2"
              as="p"
            >
              {t(($) => $.home.countdown.sectionSubtitle)}
            </Typography>
          </div>
          <LaunchCountdown
            name={nearestLaunch.name}
            launchDatetime={nearestLaunch.launchDatetime}
          />
        </section>
      ) : null}

      {isAuthenticated ? null : (
        <section className="flex flex-col items-center gap-6 bg-elevation-fill-default-2 px-4 py-16 text-center md:px-8">
          <div className="flex max-w-xl flex-col items-center gap-2">
            <Typography
              size="title-4"
              variant="prominent-1"
              className="text-text-default-1"
              as="h2"
            >
              {t(($) => $.home.footer.title)}
            </Typography>
            <Typography
              size="label-2"
              className="text-text-default-2"
              as="p"
            >
              {t(($) => $.home.footer.description)}
            </Typography>
          </div>
          <Button
            width="hug"
            link={{ to: "/login" }}
          >
            {t(($) => $.home.footer.loginBtn)}
          </Button>
        </section>
      )}
    </div>
  );
};
