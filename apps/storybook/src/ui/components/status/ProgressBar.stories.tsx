import { ProgressBar } from "@povio/ui";
import type { Meta, StoryObj } from "@storybook/react-vite";

const meta: Meta<typeof ProgressBar> = {
  component: ProgressBar,
  args: {},
};

export default meta;

type Story = StoryObj<typeof ProgressBar>;

export const Default: Story = {
  args: {
    progress: 50,
    valueLabel: "trailing",
  },
};

export const LeadingValueLabel: Story = {
  args: {
    progress: 40,
    valueLabel: "leading",
  },
};

export const NoValueLabel: Story = {
  args: {
    progress: 60,
    valueLabel: "none",
  },
};
