import {
  Checkbox,
  InfiniteTable as InfiniteTableComponent,
  PaginatedTable as PaginatedTableComponent,
  Select,
  Table,
  TextInput,
  usePagination,
} from "@povio/ui";
import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ColumnDef, RowSelectionState } from "@tanstack/react-table";
import React, { useState } from "react";

import { mockData } from "./data/mockData";
import { type CustomResponseDTO, StatusSchema } from "./data/types";

const meta: Meta<typeof Table<CustomResponseDTO>> = {
  component: Table,
  args: {
    items: mockData.slice(0, 10),
    showCellBorder: true,
    alternatingBackground: undefined,
    columns: [
      {
        accessorKey: "name",
        meta: {
          width: "w-1/6",
        },
        header: "Name",
        enableSorting: false,
        cell: ({ original }) => original.name,
      },
      {
        accessorKey: "description",
        meta: {
          width: "w-2/12",
        },
        header: "Description",
        enableSorting: false,
        cell: ({ original }) => original.description,
      },
      {
        accessorKey: "email",
        meta: {
          width: "w-1/12",
        },
        header: "Email",
        enableSorting: false,
        cell: ({ original }) => original.email,
      },
      {
        accessorKey: "address",
        meta: {
          width: "w-1/6",
        },
        header: "Address",
        enableSorting: false,
        cell: ({ original }) => original.address,
      },
      {
        accessorKey: "officeAddress",
        meta: {
          width: "w-1/12",
        },
        header: "Office Address",
        enableSorting: false,
        cell: ({ original }) => original.officeAddress,
      },
      {
        accessorKey: "organization",
        meta: {
          width: "w-1/12",
        },
        header: "Organization",
        enableSorting: false,
        cell: ({ original }) => original.organization,
      },
      {
        accessorKey: "tag",
        meta: {
          width: "w-1/12",
          cellClass: "p-0",
        },
        header: "Tag",
        enableSorting: false,
        cell: ({ original }) => (
          <TextInput
            as="inline"
            size="default"
            label="Text input"
            placeholder="Enter tag"
            value={original.tag}
            hideLabel
            className="min-w-96"
          />
        ),
      },
      {
        accessorKey: "status",
        meta: {
          width: "w-1/6",
        },
        header: "Status",
        enableSorting: false,
        cell: ({ original }) => (
          <Select
            label="Select Colour"
            value={[original.status]}
            hideLabel
            as="inline"
            size="extra-small"
            placeholder="Choose colour"
            selectionMode="multiple"
            onChange={() => {}}
            items={StatusSchema.options.map((item) => ({
              id: item,
              label: item,
            }))}
          />
        ),
      },
    ] as ColumnDef<CustomResponseDTO>[],
  },
};

export default meta;

type Story = StoryObj<typeof Table>;

export const TableDefault: Story = {
  args: {
    // oxlint-disable-next-line no-console
    onRowClick: (e) => console.log("row clicked, here's the row data: ", e),
    // oxlint-disable-next-line no-console
    onDoubleClick: (e) => console.log("row double clicked, here's the row data: ", e),
  },
};

export const TableWithRowSelection: Story = {
  render(args) {
    const [selectedRows, setSelectedRows] = useState<RowSelectionState>({
      "943da3ee-c92b-4019-a8c9-9434e6e89031": true,
      "84bf6eb8-5c1a-47ed-85e1-cb785fb9dbba": true,
    });
    const cols: ColumnDef<CustomResponseDTO>[] = [
      {
        id: "select-col",
        header: ({ table }) => (
          <Checkbox
            isSelected={table.getIsAllRowsSelected()}
            isIndeterminate={table.getIsSomeRowsSelected()}
            onChange={table.toggleAllRowsSelected}
          >
            {" "}
          </Checkbox>
        ),
        cell: ({ row }) => (
          <Checkbox
            isSelected={row.getIsSelected()}
            isDisabled={!row.getCanSelect()}
            onChange={row.getToggleSelectedHandler()}
          >
            {" "}
          </Checkbox>
        ),
      },
      ...(args.columns as ColumnDef<CustomResponseDTO>[]),
    ];
    return (
      <Table
        items={args.items as CustomResponseDTO[]}
        columns={cols}
        enableRowSelection
        enableMultiRowSelection
        defaultSelectedRows={selectedRows}
        onRowSelectionChange={setSelectedRows}
        getRowId={(row) => String(row.id)}
      />
    );
  },
};

export const TableWithSingleRowSelection: Story = {
  render(args) {
    const [selectedRows, setSelectedRows] = useState<RowSelectionState>({});

    return (
      <div>
        <p className="mb-4 text-gray-600 text-sm">
          Click on a row to select it. Only one row can be selected at a time. Selected row ID:{" "}
          {Object.keys(selectedRows)[0] || "None"}
        </p>
        <Table
          items={args.items as CustomResponseDTO[]}
          columns={args.columns as ColumnDef<CustomResponseDTO>[]}
          enableRowSelection
          defaultSelectedRows={selectedRows}
          onRowSelectionChange={setSelectedRows}
          getRowId={(row) => String(row.id)}
          // oxlint-disable-next-line no-console
          onRowClick={(row) => console.log("Row clicked:", row)}
        />
      </div>
    );
  },
};

export const PaginatedTable: Story = {
  render(args) {
    const { pagination, setPagination } = usePagination();

    const paginatedItems = React.useMemo(() => {
      const start = (pagination.pageIndex - 1) * pagination.pageSize;
      return mockData.slice(start, start + pagination.pageSize);
    }, [pagination.pageIndex, pagination.pageSize]);

    return (
      <PaginatedTableComponent
        {...args}
        items={paginatedItems}
        pagination={pagination}
        setPagination={setPagination}
        totalItems={mockData.length}
      />
    );
  },
};

export const TableInfiniteScroll: Story = {
  render: (args) => {
    const [state, setState] = React.useState({
      pageIndex: 1,
      hasNextPage: true,
      isFetchingNextPage: false,
    });

    const paginatedItems = React.useMemo(() => {
      if (state.hasNextPage) {
        return mockData.slice((state.pageIndex - 1) * 10, state.pageIndex * 10);
      }
      return mockData;
    }, [state]);

    const fetchNextPage = () => {
      setState((prev) => ({ ...prev, pageIndex: prev.pageIndex + 1, isFetchingNextPage: true }));
      setTimeout(() => {
        setState((prev) => ({ ...prev, hasNextPage: false, isFetchingNextPage: false }));
      }, 1000);
    };

    return (
      <InfiniteTableComponent
        {...args}
        items={paginatedItems}
        hasNextPage={state.hasNextPage}
        fetchNextPage={fetchNextPage}
        isFetchingNextPage={state.isFetchingNextPage}
      />
    );
  },
};

export const TableDefaultScroll: Story = {
  render: (args) => <Table {...args} />,
};

export const TableOverflowScroll: Story = {
  render: (args) => (
    <div className="max-w-[800px] overflow-x-scroll">
      <Table {...args} />
    </div>
  ),
};
