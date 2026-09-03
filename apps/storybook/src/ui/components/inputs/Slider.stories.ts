import { Slider } from "@povio/ui";
import type { Meta, StoryObj } from "@storybook/react-vite";

const meta: Meta<typeof Slider> = {
  component: Slider,
};

export default meta;

type Story = StoryObj<typeof Slider>;

export const Default: Story = {
  args: {
    label: "Percentage",
    unit: "%",
    // oxlint-disable-next-line no-console
    onChange: (val) => console.log("onChange", val),
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
    label: "No unit",
    isDisabled: true,
  },
};

export const Error: Story = {
  args: {
    label: "Error",
    error: "This is an error message",
  },
};

export const Range: Story = {
  args: {
    isRange: true,
    label: "Range",
    // oxlint-disable-next-line no-console
    onChange: (val) => console.log("onChange", val),
  },
};
