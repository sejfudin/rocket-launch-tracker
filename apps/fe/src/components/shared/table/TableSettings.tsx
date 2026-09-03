import { InlineIconButton, Segment, TextInput } from "@povio/ui";
import { clsx } from "clsx";
import { useTranslation } from "react-i18next";

import { FilterIcon } from "@/assets/icons/general/Filter";
import { FilterFilledIcon } from "@/assets/icons/general/FilterFilled";
import { GridViewIcon } from "@/assets/icons/general/GridView";
import { MDenseIcon } from "@/assets/icons/general/MDense";
import { SearchIcon } from "@/assets/icons/general/Search";
import { XlDenseIcon } from "@/assets/icons/general/XlDense";
import { XsDenseIcon } from "@/assets/icons/general/XsDense";
import type { TableSettingsType } from "@/hooks/useTableSettings";

const defaultSegmentItems = [
  { id: "sm" as const, icon: XsDenseIcon },
  { id: "md" as const, icon: MDenseIcon },
  { id: "lg" as const, icon: XlDenseIcon },
];

const extendedSegmentItems = [...defaultSegmentItems, { id: "grid" as const, icon: GridViewIcon }];

interface Props extends Omit<TableSettingsType, "debouncedSearch"> {
  enableGridView?: boolean;
  className?: string;
}

export function TableSettings(props: Props) {
  const { t } = useTranslation();
  const {
    showFilters,
    toggleFilters,
    tableStyle,
    selectTableStyle,
    search,
    setSearch,
    enableGridView = false,
    className,
  } = props;

  return (
    <div className={clsx("ml-auto flex items-center gap-4", className)}>
      <InlineIconButton
        color={showFilters ? "primary" : "secondary"}
        icon={showFilters ? FilterFilledIcon : FilterIcon}
        label={showFilters ? t(($) => $.shared.tables.hideFilters) : t(($) => $.shared.tables.showFilters)}
        onPress={toggleFilters}
        className="p-0-5"
      />
      <TextInput
        variant="outlined"
        as="inline"
        size="extra-small"
        label={t(($) => $.shared.tables.search)}
        placeholder={t(($) => $.shared.tables.searchPlaceholder)}
        hideLabel
        value={search}
        onChange={(value) => setSearch(value)}
        leadingIcon={SearchIcon}
        className="border! rounded-s border-input-outlined-outline-idle! bg-elevation-fill-default-1"
        inputClassName="w-64"
      />
      <Segment
        items={enableGridView ? extendedSegmentItems : defaultSegmentItems}
        value={tableStyle}
        onChange={selectTableStyle}
        className="w-fit!"
      />
    </div>
  );
}
