import { Autocomplete } from "@povio/ui";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useCallback, useMemo, useState } from "react";
import { z } from "zod";

import { RestClient } from "@/clients/rest/rest-client";

const restClient = new RestClient({ config: { baseURL: "https://swapi.py4e.com/api/" } });

const PeopleResponseSchema = z
  .object({
    count: z.number(),
    next: z.string().url().nullable(),
    previous: z.string().url().nullable(),
    results: z.array(z.object({ name: z.string() })),
  })
  .passthrough();

const getPeople = (params: { page?: string; search?: string }) => {
  return restClient.get({ resSchema: PeopleResponseSchema }, "/people", { params: { ...params, format: "json" } });
};

const useGetPeopleInfinite = (props: { page?: string; search?: string }) => {
  return useInfiniteQuery({
    queryKey: ["/people", props],
    queryFn: ({ pageParam }) => getPeople({ ...props, page: pageParam }),
    getNextPageParam: ({ next }) => (next ? new URLSearchParams(next.split("?")[1]).get("page") : undefined),
    initialPageParam: "1",
  });
};

const AsyncAutocomplete = () => {
  const [value, setValue] = useState<string | null>("Boba Fett");
  const [values, setValues] = useState<string[]>(["Boba Fett", "Luke Skywalker"]);
  const [search, setSearch] = useState("");

  const { data, isLoading, fetchNextPage, hasNextPage } = useGetPeopleInfinite({ search });

  const items = useMemo(
    () => data?.pages.flatMap((page) => page.results.map((result) => ({ id: result.name, label: result.name }))) ?? [],
    [data?.pages],
  );

  const onSearchChange = useCallback(
    (searchValue: string) => {
      // oxlint-disable-next-line no-console
      console.log("AsyncSelect onSearchChange", searchValue);
      setSearch(searchValue);
    },
    [setSearch],
  );

  const onLoadMore = useCallback(() => {
    // oxlint-disable-next-line no-console
    console.log("AsyncSelect onLoadMore");
    fetchNextPage();
  }, [fetchNextPage]);

  return (
    <div className="flex flex-col gap-4">
      <Autocomplete
        label="Select an item"
        placeholder="Select an item"
        value={value}
        onChange={(val) => {
          // oxlint-disable-next-line no-console
          console.log("AsyncSelect onChange", val);
          setValue(val);
        }}
        onSearchChange={onSearchChange}
        items={items}
        hasLoadMore={hasNextPage}
        isLoading={isLoading}
        onLoadMore={onLoadMore}
        initialSelection={{ id: "Boba Fett", label: "Boba Fett" }}
        isClearable
      />
      <Autocomplete
        label="Select items"
        placeholder="Select items"
        value={values}
        onChange={(val) => {
          // oxlint-disable-next-line no-console
          console.log("AsyncSelect onChange", val);
          setValues(val);
        }}
        onSearchChange={onSearchChange}
        items={items}
        hasLoadMore={hasNextPage}
        isLoading={isLoading}
        onLoadMore={onLoadMore}
        mapInitialToSelectItem={(item: { id: string; name: string }) => ({
          id: item.id,
          label: item.name ?? "",
        })}
        initialSelection={[
          { id: "Boba Fett", name: "Boba Fett" },
          { id: "Luke Skywalker", name: "Luke Skywalker" },
        ]}
        selectionMode="multiple"
        isClearable
      />
    </div>
  );
};

const meta: Meta<typeof AsyncAutocomplete> = {
  component: AsyncAutocomplete,
};

export default meta;

type Story = StoryObj<typeof AsyncAutocomplete>;

export const Default: Story = {
  args: {},
};
