import { Button, ColumnConfigModal, Select, Table, TextInput, useTableColumnConfig } from "@povio/ui";
import type { StoryObj } from "@storybook/react-vite";
import type { ColumnDef } from "@tanstack/react-table";
import React, { useState } from "react";

import { mockData } from "./data/mockData";
import { type CustomResponseDTO, StatusSchema } from "./data/types";

export default {};
const tableColumns: ColumnDef<CustomResponseDTO>[] = [
  {
    id: "name",
    accessorKey: "name",
    meta: {
      width: "w-1/6",
    },
    header: "Name",
    enableSorting: false,
    cell: ({ original }) => original.name,
  },
  {
    id: "description",
    accessorKey: "description",
    meta: {
      width: "w-2/12",
    },
    header: "Description",
    enableSorting: false,
    cell: ({ original }) => original.description,
  },
  {
    id: "email",
    accessorKey: "email",
    meta: {
      width: "w-1/12",
    },
    header: "Email",
    enableSorting: false,
    cell: ({ original }) => original.email,
  },
  {
    id: "address",
    accessorKey: "address",
    meta: {
      width: "w-1/6",
    },
    header: "Address",
    enableSorting: false,
    cell: ({ original }) => original.address,
  },
  {
    id: "officeAddress",
    accessorKey: "officeAddress",
    meta: {
      width: "w-1/12",
    },
    header: "Office Address",
    enableSorting: false,
    cell: ({ original }) => original.officeAddress,
  },
  {
    id: "organization",
    accessorKey: "organization",
    meta: {
      width: "w-1/12",
    },
    header: "Organization",
    enableSorting: false,
    cell: ({ original }) => original.organization,
  },
  {
    id: "tag",
    accessorKey: "tag",
    meta: {
      width: "w-1/12",
    },
    header: "Tag",
    enableSorting: false,
    cell: ({ original }) => (
      <TextInput
        as="inline"
        label="Text input"
        value={original.tag}
        hideLabel
        className="min-w-96"
      />
    ),
  },
  {
    id: "status",
    accessorKey: "status",
    meta: {
      width: "w-1/6",
    },
    header: "Status",
    enableSorting: false,
    cell: ({ original }) => (
      <Select
        label="Select Colour"
        value={original.status}
        hideLabel
        as="inline"
        placeholder="Choose colour"
        onChange={() => {}}
        items={StatusSchema.options.map((item) => ({
          id: item,
          label: item,
        }))}
      />
    ),
  },
];

type Story = StoryObj;

export const ColumnConfigExample: Story = {
  render: () => {
    const [isConfigOpen, setIsConfigOpen] = React.useState(false);
    const [data, setData] = useState(mockData.slice(0, 10));
    const config = useTableColumnConfig(tableColumns);
    const { columns, configColumns, visibleColumns, onVisibilityChange, onOrderChange } = config;

    const handleReorder = (reorderedItems: CustomResponseDTO[]) => {
      setData(reorderedItems);
    };

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg">Table with Column Configuration</h3>
          <Button
            variant="contained"
            color="primary"
            onClick={() => setIsConfigOpen(true)}
          >
            Configure Columns
          </Button>
        </div>

        <Table
          items={data}
          columns={columns}
          showCellBorder
          enableDragDrop
          getRowId={(row) => row.id}
          onReorder={handleReorder}
          className="min-w-[900px]"
        />

        <ColumnConfigModal
          isOpen={isConfigOpen}
          onClose={() => setIsConfigOpen(false)}
          configColumns={configColumns}
          visibleColumns={visibleColumns}
          onVisibilityChange={onVisibilityChange}
          onOrderChange={onOrderChange}
        />
      </div>
    );
  },
};
