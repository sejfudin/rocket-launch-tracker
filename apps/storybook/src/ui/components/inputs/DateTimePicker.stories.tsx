import { DateTimePicker } from "@povio/ui";
import type { Meta, StoryObj } from "@storybook/react-vite";

const meta: Meta<typeof DateTimePicker> = {
  component: DateTimePicker,
  args: {
    label: "Date",
    disableDropdown: false,
    // oxlint-disable-next-line no-console
    onChange: (val) => console.log("onChange", val),
    isClearable: false,
    todayIcon: false,
    shouldForceLeadingZeros: false,
  },
};

export default meta;

type Story = StoryObj<typeof DateTimePicker>;

export const Default: Story = {};

export const Filled: Story = {
  args: {
    variant: "filled",
  },
};

export const Floating: Story = {
  args: {
    as: "floating",
  },
};

export const Inline: Story = {
  args: {
    as: "inline",
  },
};

export const HiddenLabel: Story = {
  args: {
    hideLabel: true,
  },
};

export const Disabled: Story = {
  args: {
    isDisabled: true,
  },
};

export const Error: Story = {
  args: {
    ...Default.args,
    error: "This is an error message",
  },
};

export const TimeOptional: Story = {
  args: {
    isTimeOptional: true,
  },
};

export const DisableManualEntry: Story = {
  args: {
    ...Default.args,
    isClearable: true,
    disableManualEntry: true,
    placeholder: "Select a date",
  },
};
