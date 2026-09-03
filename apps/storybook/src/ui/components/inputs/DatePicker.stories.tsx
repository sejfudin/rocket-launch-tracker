import { DatePicker } from "@povio/ui";
import type { Meta, StoryObj } from "@storybook/react-vite";

const meta: Meta<typeof DatePicker> = {
  component: DatePicker,
  args: {
    todayIcon: false,
    shouldForceLeadingZeros: false,
  },
};

export default meta;

type Story = StoryObj<typeof DatePicker>;

export const Default: Story = {
  args: {
    label: "Date",
    disableDropdown: false,
    // oxlint-disable-next-line no-console
    onChange: (val) => console.log("onChange", val),
    isClearable: false,
  },
};

export const Filled: Story = {
  args: {
    ...Default.args,
    variant: "filled",
  },
};

export const Inline: Story = {
  args: {
    ...Default.args,
    as: "inline",
  },
};

export const Floating: Story = {
  args: {
    ...Default.args,
    as: "floating",
  },
};

export const HiddenLabel: Story = {
  args: {
    ...Default.args,
    hideLabel: true,
  },
};

export const Disabled: Story = {
  args: {
    ...Default.args,
    isDisabled: true,
  },
};

export const Error: Story = {
  args: {
    ...Default.args,
    error: "This is a message",
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
