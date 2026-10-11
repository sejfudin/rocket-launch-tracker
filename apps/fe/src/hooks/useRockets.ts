import type { RocketModels } from "@/openapi/rocket/rocket.models";
import { RocketQueries } from "@/openapi/rocket/rocket.queries";

const ROCKET_PAGE_SIZE = 9;

export const useRocketList = (search?: string) => {
  const filter: RocketModels.RocketPaginationFilterDto | undefined = search ? { search } : undefined;

  return RocketQueries.usePaginatePublicInfinite({
    limit: ROCKET_PAGE_SIZE,
    order: "-createdAt",
    filter,
  });
};

export const useRocket = (id?: string) => {
  return RocketQueries.useFind({ id: id ?? "" }, { enabled: Boolean(id) });
};

export const useCreateRocket = () => {
  return RocketQueries.useCreate();
};
