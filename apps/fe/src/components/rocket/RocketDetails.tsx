import type { ApplicationException } from "@povio/ui";
import { Button, IconButton, TextButton, Typography } from "@povio/ui";
import { Link } from "@tanstack/react-router";
import { clsx } from "clsx";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { ArrowLeftIcon } from "@/assets/icons/general/ArrowLeft";
import { ChevRightIcon } from "@/assets/icons/general/ChevRight";
import { SortIcon } from "@/assets/icons/general/Sort";
import fallbackImage from "@/assets/images/fallback-image.png";
import { LaunchCountdown } from "@/components/rocket/LaunchCountdown";
import { AppHead } from "@/components/shared/head/AppHead";
import { ErrorState } from "@/components/shared/layout/ErrorState";
import { LoadingState } from "@/components/shared/layout/LoadingState";
import { Separator } from "@/components/shared/layout/Separator";
import { useRocket } from "@/hooks/useRockets";
import { RocketModels } from "@/openapi/rocket/rocket.models";
import { LaunchUtils } from "@/utils/launch.utils";
import { RocketErrorUtils } from "@/utils/rocket-error.utils";

const SORT_STORAGE_KEY = "rocket-member-sort";

type SortOrder = "asc" | "desc";

interface RocketDetailsProps {
  rocketId: string;
}

const formatHeight = (height: number | null | undefined) => {
  if (height == null) {
    return null;
  }

  return height.toLocaleString("de-DE", { maximumFractionDigits: 1 });
};

const readSortOrder = (): SortOrder | null => {
  const value = localStorage.getItem(SORT_STORAGE_KEY);
  return value === "asc" || value === "desc" ? value : null;
};

const sortMembers = (members: string[], order: SortOrder | null) => {
  if (!order) {
    return members;
  }

  const sorted = [...members].sort((left, right) => left.localeCompare(right));
  return order === "desc" ? sorted.reverse() : sorted;
};

interface DetailFieldProps {
  label: string;
  value?: string | null;
}

const DetailField = ({ label, value }: DetailFieldProps) => (
  <div className="flex min-w-0 flex-col">
    <Typography
      size="label-2"
      as="span"
      className="font-labels-default text-text-default-2"
    >
      {label}
    </Typography>
    <Typography
      size="label-1"
      as="span"
      className="font-labels-default text-text-default-1"
    >
      {value}
    </Typography>
  </div>
);

export const RocketDetails = ({ rocketId }: RocketDetailsProps) => {
  const { t } = useTranslation();
  const { data: rocket, isLoading, isError, error, refetch } = useRocket(rocketId);
  const [sortOrder, setSortOrder] = useState<SortOrder | null>(readSortOrder);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isSortOpen) {
      return;
    }

    const onPointerDown = (event: MouseEvent) => {
      if (!sortRef.current?.contains(event.target as Node)) {
        setIsSortOpen(false);
      }
    };

    document.addEventListener("mousedown", onPointerDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
    };
  }, [isSortOpen]);

  const selectSortOrder = (order: SortOrder | null) => {
    setSortOrder(order);
    if (order) {
      localStorage.setItem(SORT_STORAGE_KEY, order);
    } else {
      localStorage.removeItem(SORT_STORAGE_KEY);
    }
    setIsSortOpen(false);
  };

  const sortOptions = [
    { order: null, label: t(($) => $.rockets.details.sortDefault), icon: <SortIcon className="size-4" /> },
    {
      order: "asc",
      label: t(($) => $.rockets.details.sortAscending),
      icon: <ArrowLeftIcon className="size-4 rotate-90" />,
    },
    {
      order: "desc",
      label: t(($) => $.rockets.details.sortDescending),
      icon: <ArrowLeftIcon className="size-4 -rotate-90" />,
    },
  ] as const;

  const isCommercial = rocket?.rocketType === RocketModels.RocketType.commercial;
  const members = sortMembers(
    ((isCommercial ? rocket?.passengers : rocket?.crew) ?? []).filter((member) => member.trim()),
    sortOrder,
  );
  const weight = LaunchUtils.formatWeight(rocket?.weight);
  const height = formatHeight(rocket?.height);

  return (
    <>
      <AppHead
        title={
          rocket ? t(($) => $.rockets.details.title, { name: rocket.name }) : t(($) => $.rockets.details.breadcrumb)
        }
      />
      <div className="flex flex-col gap-8 bg-elevation-fill-default-1 px-4 py-8 md:px-8">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-1">
            <Link to="/">
              <Typography
                size="label-3"
                as="span"
                className="text-text-default-3"
              >
                {t(($) => $.navbar.links.rockets)}
              </Typography>
            </Link>
            <ChevRightIcon className="size-4 text-text-default-3" />
            <Typography
              size="label-3"
              as="span"
              className="text-interactive-text-primary-idle"
            >
              {t(($) => $.rockets.details.breadcrumb)}
            </Typography>
          </div>

          <div className="flex items-center gap-2">
            <IconButton
              label={t(($) => $.rockets.details.back)}
              icon={ArrowLeftIcon}
              variant="ghost"
              color="primary"
              size="xs"
              link={{ to: "/" }}
            />
            <Typography
              size="title-3"
              variant="prominent-1"
              as="h1"
              className="text-text-default-1"
            >
              {rocket
                ? t(($) => $.rockets.details.title, { name: rocket.name })
                : t(($) => $.rockets.details.breadcrumb)}
            </Typography>
          </div>
        </div>

        {isLoading ? <LoadingState /> : null}

        {isError ? (
          <ErrorState
            error={error}
            message={RocketErrorUtils.getErrorMessage(error as ApplicationException<string>, t)}
            onRetry={() => {
              refetch();
            }}
          />
        ) : null}

        {rocket ? (
          <>
            <section className="flex flex-col gap-4">
              <Typography
                size="title-6"
                variant="prominent-1"
                as="h2"
                className="text-text-default-1"
              >
                {t(($) => $.rockets.form.basicInfo)}
              </Typography>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                <DetailField
                  label={t(($) => $.rockets.card.name)}
                  value={rocket.name}
                />
                <DetailField
                  label={t(($) => $.rockets.card.launchDate)}
                  value={LaunchUtils.formatLaunchLabel(rocket.launchDatetime)}
                />
                <DetailField
                  label={t(($) => $.rockets.card.weight)}
                  value={weight ? t(($) => $.rockets.card.weightUnit, { value: weight }) : null}
                />
                <DetailField
                  label={t(($) => $.rockets.card.height)}
                  value={height ? t(($) => $.rockets.card.heightUnit, { value: height }) : null}
                />
              </div>
            </section>

            <Separator showLabel={false} />

            <section className="relative flex h-[423px] flex-col items-center justify-center gap-6 overflow-hidden rounded-xl px-6 py-6 text-center">
              <img
                src={fallbackImage}
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="relative z-10 flex w-full flex-col items-center gap-6">
                <div className="flex flex-col items-center gap-1">
                  <Typography
                    size="title-3"
                    variant="prominent-1"
                    as="h2"
                    className="text-text-inverted-1"
                  >
                    {t(($) => $.rockets.details.launchTitle, { name: rocket.name })}
                  </Typography>
                  <Typography
                    size="title-5"
                    as="p"
                    className="text-text-inverted-1"
                  >
                    {t(($) => $.rockets.details.launchSubtitle)}
                  </Typography>
                </div>
                {rocket.launchDatetime ? (
                  <LaunchCountdown
                    name={rocket.name}
                    launchDatetime={rocket.launchDatetime}
                  />
                ) : null}
              </div>
            </section>

            {members.length > 0 ? (
              <section className="flex flex-col gap-4">
                <div className="flex items-center justify-between gap-4">
                  <Typography
                    size="title-6"
                    variant="prominent-1"
                    as="h2"
                    className="text-text-default-1"
                  >
                    {isCommercial ? t(($) => $.rockets.details.passengersInfo) : t(($) => $.rockets.details.crewInfo)}
                  </Typography>
                  <div
                    ref={sortRef}
                    className="relative"
                  >
                    <TextButton
                      type="button"
                      icon={SortIcon}
                      aria-expanded={isSortOpen}
                      onPress={() => setIsSortOpen((open) => !open)}
                    >
                      {isCommercial ? t(($) => $.rockets.details.sortPassengers) : t(($) => $.rockets.details.sortCrew)}
                    </TextButton>
                    {isSortOpen ? (
                      <div className="absolute top-full right-0 z-10 mt-2 flex min-w-52 flex-col divide-y divide-elevation-outline-default-1 overflow-hidden rounded-m border border-elevation-outline-default-1 bg-elevation-fill-default-1 shadow-sm">
                        {sortOptions.map(({ order, label, icon }) => (
                          <button
                            key={order ?? "default"}
                            type="button"
                            className={clsx(
                              "flex items-center gap-2 px-3 py-2 text-left hover:bg-elevation-fill-default-2",
                              sortOrder === order ? "text-interactive-text-primary-idle" : "text-text-default-1",
                            )}
                            onClick={() => selectSortOrder(order)}
                          >
                            {icon}
                            <Typography
                              size="label-2"
                              variant={sortOrder === order ? "prominent-1" : "default"}
                              as="span"
                            >
                              {label}
                            </Typography>
                          </button>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                  {members.map((member, index) => (
                    <DetailField
                      key={`${member}-${index}`}
                      label={
                        isCommercial
                          ? t(($) => $.rockets.form.passengerName, { index: index + 1 })
                          : t(($) => $.rockets.form.crewMember, { index: index + 1 })
                      }
                      value={member}
                    />
                  ))}
                </div>
              </section>
            ) : null}

            <div className="flex justify-end">
              <Button
                variant="outlined"
                color="secondary"
                width="hug"
                link={{ to: "/" }}
              >
                {t(($) => $.rockets.details.back)}
              </Button>
            </div>
          </>
        ) : null}
      </div>
    </>
  );
};
