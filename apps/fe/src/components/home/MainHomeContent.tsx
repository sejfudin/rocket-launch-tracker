import { Button, TextInput, Typography } from "@povio/ui";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { SearchIcon } from "@/assets/icons/general/Search";
import { CreateRocketModal } from "@/components/rocket/CreateRocketModal";
import { LaunchCountdown } from "@/components/rocket/LaunchCountdown";
import { RocketCard } from "@/components/rocket/RocketCard";
import { ErrorState } from "@/components/shared/layout/ErrorState";
import { LoadingState } from "@/components/shared/layout/LoadingState";
import { useAuth } from "@/hooks/useAuth";
import { useDebounce } from "@/hooks/useDebounce";
import { useRocketList } from "@/hooks/useRockets";
import { LaunchUtils } from "@/utils/launch.utils";

export const MainHomeContent = () => {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const [search, setSearch] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const debouncedSearch = useDebounce(search, 500);
  const { data, isLoading, isError, error, refetch, hasNextPage, isFetchingNextPage, fetchNextPage } = useRocketList(
    debouncedSearch.trim() || undefined,
  );
  const rockets = data?.pages.flatMap((page) => page.items ?? []) ?? [];
  const nearestLaunch = LaunchUtils.findNearestUpcoming(rockets);

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

      {isAuthenticated ? (
        <div className="flex w-full max-w-6xl justify-end">
          <Button
            width="hug"
            onPress={() => setIsCreateOpen(true)}
          >
            {t(($) => $.rockets.addNewRocket)}
          </Button>
        </div>
      ) : null}

      <CreateRocketModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
      />

      <TextInput
        variant="outlined"
        as="inline"
        label={t(($) => $.home.content.search)}
        placeholder={t(($) => $.home.content.search)}
        hideLabel
        value={search}
        onChange={setSearch}
        leadingIcon={SearchIcon}
        className="border! w-full max-w-xl rounded-s border-input-outlined-outline-idle! bg-elevation-fill-default-1"
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

      {nearestLaunch?.launchDatetime ? (
        <LaunchCountdown
          name={nearestLaunch.name}
          launchDatetime={nearestLaunch.launchDatetime}
        />
      ) : null}
    </div>
  );
};
