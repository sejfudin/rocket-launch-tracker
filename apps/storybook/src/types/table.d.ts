/* oxlint-disable unused-imports/no-unused-vars */
import "@tanstack/react-table";

declare module "@tanstack/react-table" {
  interface ColumnMeta<TData extends RowData, TValue> {
    width?: string;
    headerClass?: string;
    cellClass?: string;
    sortClass?: string;
  }

  interface CellContext<TData extends RowData, TValue> {
    original: TData;
    data: TData;
    value: TValue;
  }
}
