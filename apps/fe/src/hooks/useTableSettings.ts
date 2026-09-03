import { useMemo, useState } from "react";

import type { TableRowVariantProps } from "@/styles/overrides/tables/table.cva";

import { useDebounce } from "./useDebounce";

type TableRowSize = TableRowVariantProps["rowSize"];
type TableStyle = TableRowSize | "grid";

export interface TableSettingsType {
  showFilters: boolean;
  rowSize: TableRowSize;
  tableStyle: TableStyle;
  search: string | undefined;
  debouncedSearch: string | undefined;
  toggleFilters: () => void;
  selectTableStyle: (value: TableStyle | null) => void;
  setSearch: (value: string | undefined) => void;
}

export const useTableSettings = (defaultTableSize: TableRowSize = "md"): TableSettingsType => {
  const [showFilters, setShowFilters] = useState(true);
  const [tableStyle, setTableStyle] = useState<TableStyle>(defaultTableSize);
  const [search, setSearch] = useState<string | undefined>(undefined);

  const debouncedSearch = useDebounce(search, 500);

  const rowSize = useMemo(() => {
    if (tableStyle === "grid") {
      return defaultTableSize;
    }
    return tableStyle;
  }, [tableStyle, defaultTableSize]);

  const toggleFilters = () => {
    setShowFilters((prev) => !prev);
  };

  const selectTableStyle = (value: TableStyle | null) => {
    if (!value) {
      return;
    }

    setTableStyle(value);
  };

  return {
    showFilters,
    tableStyle,
    rowSize,
    search,
    debouncedSearch,
    toggleFilters,
    selectTableStyle,
    setSearch,
  };
};
