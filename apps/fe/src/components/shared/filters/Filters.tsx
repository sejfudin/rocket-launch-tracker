// oxlint-disable no-explicit-any
// oxlint-disable no-unsafe-argument
// oxlint-disable no-unsafe-member-access
import { Button, type FilterStore, type InputDef, Inputs, useFormAutosave } from "@povio/ui";
import { clsx } from "clsx";
import { useMemo } from "react";
import type { DefaultValues } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { z } from "zod";

interface FiltersProps<TSchema extends z.ZodObject<any>> {
  schema: TSchema;
  store: FilterStore<z.infer<TSchema>>;
  filterDefs: InputDef<z.infer<TSchema>>[];
  className?: string;
}

const unwrapZodType = (schemaType: z.core.$ZodType) => {
  let unwrappedType = schemaType;
  while (unwrappedType instanceof z.ZodNullable || unwrappedType instanceof z.ZodOptional) {
    unwrappedType = unwrappedType.unwrap();
  }
  return unwrappedType;
};

export const Filters = <TSchema extends z.ZodObject<any>>({
  schema,
  store,
  filterDefs,
  className,
}: FiltersProps<TSchema>) => {
  const { t } = useTranslation();
  const form = useFormAutosave<z.infer<TSchema>>({
    zodSchema: schema as z.ZodType<z.infer<TSchema>, z.infer<TSchema>, any>,
    getResetValues: () => {
      const resetValues: Partial<z.infer<TSchema>> = {};

      const schemaKeys = Object.keys(schema.shape) as (keyof z.infer<TSchema>)[];
      schemaKeys.forEach((key) => {
        const value = store.getFilterValue([key])[key];
        if (value) {
          resetValues[key] = value;
          return;
        }

        // oxlint-disable-next-line no-unsafe-assignment
        const schemaKeyType = schema.shape[key];
        const keyType = unwrapZodType(schemaKeyType);

        let defaultValue: unknown = null;
        if (keyType instanceof z.ZodArray) {
          defaultValue = [];
        } else if (keyType instanceof z.ZodString) {
          defaultValue = "";
        }

        resetValues[key] = defaultValue as z.infer<TSchema>[typeof key];
      });

      return resetValues as DefaultValues<z.infer<TSchema>>;
    },
    resetDeps: [store.filterData],
    onAutosave: async (data) => {
      store.setFilterValue(data);
    },
    autosaveDelay: 0,
  });

  const inputDefs = useMemo(
    () =>
      filterDefs.map((inputDef) => ({
        ...inputDef,
        props: {
          ...inputDef.props,
          as: "filter" as const,
          size: "extra-small" as const,
        },
      })) as typeof filterDefs,
    [filterDefs],
  );

  return (
    <div className={clsx("flex flex-wrap items-center gap-3-5 self-stretch px-3 py-1-5 [&>div]:w-fit", className)}>
      <Inputs
        form={form}
        inputDefs={inputDefs}
      />

      <Button
        variant="subtle"
        size="xs"
        color="secondary"
        width="hug"
        onPress={() => store.clearAllFilters()}
      >
        {t(($) => $.shared.actions.clearAll)}
      </Button>
    </div>
  );
};
