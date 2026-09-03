import { DateRangePicker } from "@povio/ui";
import type { Meta, StoryObj } from "@storybook/react-vite";

const meta: Meta<typeof DateRangePicker> = {
  component: DateRangePicker,
  args: {
    todayIcon: false,
    shouldForceLeadingZeros: false,
  },
};

export default meta;

type Story = StoryObj<typeof DateRangePicker>;

export const Default: Story = {
  args: {
    label: "Date Range",
    // oxlint-disable-next-line no-console
    onChange: (val) => console.log("onChange", val),
    isClearable: true,
  },
};

export const WithDefaultValue: Story = {
  args: {
    ...Default.args,
    label: "Date Range with Default",
    value: {
      start: "2024-01-15",
      end: "2024-01-22",
    },
  },
};

export const ISODateOnly: Story = {
  args: {
    ...Default.args,
    label: "Date Range (ISO Date only)",
    fullIso: false,
    value: {
      start: "2024-01-15T00:00:00.000Z",
      end: "2024-01-22T00:00:00.000Z",
    },
  },
};

export const Filled: Story = {
  args: {
    ...Default.args,
    variant: "filled",
  },
};

export const Floating: Story = {
  args: {
    ...Default.args,
    as: "floating",
  },
};

export const Inline: Story = {
  args: {
    ...Default.args,
    as: "inline",
  },
};

export const HiddenLabel: Story = {
  args: {
    ...Default.args,
    hideLabel: true,
  },
};

export const WithoutSidebar: Story = {
  args: {
    ...Default.args,
    hideSidebar: true,
  },
};

export const Required: Story = {
  args: {
    ...Default.args,
    label: "Required Date Range",
    isRequired: true,
    isClearable: false,
  },
};

export const WithHelperText: Story = {
  args: {
    ...Default.args,
    label: "Project Duration",
    helperText: "Select the start and end dates for your project",
    tooltipText: "Choose dates within the current year",
  },
};

export const Disabled: Story = {
  args: {
    ...Default.args,
    label: "Disabled Date Range",
    isDisabled: true,
    value: {
      start: "2024-01-15T00:00:00.000Z",
      end: "2024-01-22T00:00:00.000Z",
    },
  },
};

export const Error: Story = {
  args: {
    ...Default.args,
    error: "Please select a valid date range",
  },
};

export const DisableManualEntry: Story = {
  args: {
    ...Default.args,
    disableManualEntry: true,
    placeholder: "Select a date range",
  },
};
