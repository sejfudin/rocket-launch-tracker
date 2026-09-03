import { RocketQueries } from "@/openapi/rocket/rocket.queries";

export const useRocketModelOptions = () => {
  const { data: models, ...rest } = RocketQueries.useListModels();
  const modelOptions = models?.map((m) => ({ id: m.id, label: m.name })) ?? [];

  return { modelOptions, models, ...rest };
};
