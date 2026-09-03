import { NumberInput, Pagination, PaginationList, TextButton, Typography, usePagination } from "@povio/ui";
import type { Meta, StoryObj } from "@storybook/react-vite";
import React, { useEffect, useState } from "react";

const meta: Meta<typeof Pagination> = {
  component: (args) => {
    const { pagination, setPagination } = usePagination({
      pageIndex: 1,
      pageSize: args.pageSize,
    });
    return (
      <Pagination
        {...args}
        page={pagination.pageIndex}
        pageSize={pagination.pageSize}
        onPageChange={(page) => setPagination({ ...pagination, pageIndex: page })}
        onPageSizeChange={(pageSize) => setPagination({ ...pagination, pageSize, pageIndex: 1 })}
      />
    );
  },
  args: {
    page: 1,
    pageSize: 10,
    totalItems: 100,
    hideFirstLast: true,
    hideText: false,
    className: "justify-end",
  },
};

export default meta;

type Story = StoryObj<typeof Pagination>;

export const PaginationDefault: Story = {
  args: {
    className: "justify-center",
  },
};

export const CustomLayoutWithPageSize: Story = {
  render: (args) => {
    const { pagination, setPagination } = usePagination({
      pageIndex: 1,
      pageSize: args.pageSize ?? 10,
    });

    return (
      <div className="flex items-center justify-between">
        <PaginationList
          page={pagination.pageIndex}
          totalPages={args.totalPages ?? 10}
          hideText={args.hideText}
          hideFirstLast={args.hideFirstLast}
          size={args.size}
          variant={args.variant}
          color={args.color}
          onPageChange={(page) => setPagination({ ...pagination, pageIndex: page })}
        />

        <div className="flex items-center gap-2">
          <Typography
            variant="default"
            size="label-2"
            as="span"
            className="whitespace-nowrap text-text-default-1"
          >
            Results per page
          </Typography>
          <NumberInput
            value={pagination.pageSize}
            onChange={(value) => setPagination({ ...pagination, pageSize: Number(value), pageIndex: 1 })}
            label="Results per page"
            hideLabel
            className="w-min"
            inputClassName="min-w-12 !px-3 !py-0-5"
          />
          <Typography
            variant="default"
            size="label-2"
            as="span"
            className="flex-fill text-right text-text-default-1"
          >
            {(pagination.pageIndex - 1) * pagination.pageSize + 1} -{" "}
            {Math.min(pagination.pageIndex * pagination.pageSize, args.totalItems)} of {args.totalItems}
          </Typography>
        </div>
      </div>
    );
  },
  args: {
    page: 1,
    pageSize: 10,
    totalItems: 100,
    hideFirstLast: true,
    hideText: false,
    size: "s",
    variant: "subtle",
    color: "secondary",
  },
};

export const CustomLayoutWithPageJump: Story = {
  render: (args) => {
    const totalPages = args.totalPages ?? 10;
    const { pagination, setPagination } = usePagination({
      pageIndex: 1,
      pageSize: args.pageSize,
    });
    const [inputPage, setInputPage] = useState<number | null>(pagination.pageIndex);

    useEffect(() => {
      setInputPage(pagination.pageIndex);
    }, [pagination.pageIndex]);

    return (
      <div className="flex w-full items-center justify-between gap-4 p-4">
        <Typography
          variant="default"
          size="label-2"
          as="span"
          className="whitespace-nowrap text-text-default-1"
        >
          Viewing {(pagination.pageIndex - 1) * pagination.pageSize + 1} -{" "}
          {Math.min(pagination.pageIndex * pagination.pageSize, args.totalItems)} of {args.totalItems} results
        </Typography>

        <div className="flex items-center gap-4">
          <PaginationList
            page={pagination.pageIndex}
            totalPages={totalPages}
            hideText={args.hideText}
            hidePrevNext={args.hidePrevNext}
            hideFirstLast={args.hideFirstLast}
            size={args.size}
            variant={args.variant}
            color={args.color}
            onPageChange={(page) => setPagination({ ...pagination, pageIndex: page })}
          />
          <div className="flex items-center gap-2">
            <Typography
              variant="default"
              size="label-2"
              as="span"
              className="text-text-default-1"
            >
              Page
            </Typography>
            <NumberInput
              value={inputPage}
              placeholder={pagination.pageIndex.toString()}
              label="Page"
              hideLabel
              className="w-min"
              inputClassName="min-w-10 !px-3 !py-0-5"
              onChange={(value) => {
                if (value && value >= 1 && value <= totalPages) {
                  setInputPage(value);
                }
              }}
            />
            <TextButton
              color="secondary"
              onPress={() => setPagination({ ...pagination, pageIndex: Number(inputPage) })}
            >
              Go
            </TextButton>
          </div>
        </div>
      </div>
    );
  },
  args: {
    page: 1,
    pageSize: 10,
    totalItems: 430,
    hideFirstLast: true,
    hideText: false,
    hidePrevNext: true,
    size: "s",
    variant: "outlined",
    color: "secondary",
  },
};

export const MinimalWithItemCount: Story = {
  render: (args) => {
    const { pagination, setPagination } = usePagination({
      pageIndex: 1,
      pageSize: args.pageSize,
    });

    return (
      <div className="flex items-center justify-end gap-6">
        <div className="flex items-center gap-2">
          <Typography
            variant="default"
            size="label-2"
            as="span"
            className="whitespace-nowrap text-text-default-1"
          >
            Results per page
          </Typography>
          <NumberInput
            value={pagination.pageSize}
            onChange={(value) => setPagination({ ...pagination, pageSize: Number(value), pageIndex: 1 })}
            label="Results per page"
            hideLabel
            className="w-min"
            inputClassName="min-w-12 !px-3 !py-0-5"
          />
        </div>
        <div className="flex">
          <Typography
            variant="default"
            size="label-2"
            as="span"
            className="flex-fill text-right text-text-default-1"
          >
            {(pagination.pageIndex - 1) * pagination.pageSize + 1} -{" "}
            {Math.min(pagination.pageIndex * pagination.pageSize, args.totalItems)} of {args.totalItems}
          </Typography>
        </div>
        <PaginationList
          page={pagination.pageIndex}
          totalPages={args.totalPages ?? 10}
          hideText={args.hideText}
          hideFirstLast={args.hideFirstLast}
          hideNumbers={args.hideNumbers}
          size={args.size}
          variant={args.variant}
          color={args.color}
          onPageChange={(page) => setPagination({ ...pagination, pageIndex: page })}
        />
      </div>
    );
  },
  args: {
    page: 1,
    pageSize: 10,
    totalItems: 100,
    hideFirstLast: true,
    hideText: true,
    hideNumbers: true,
    size: "s",
    variant: "outlined",
    color: "secondary",
  },
};
