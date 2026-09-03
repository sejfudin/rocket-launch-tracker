import { ToggleButton } from "@povio/ui";
import type { Meta, StoryObj } from "@storybook/react-vite";

const meta: Meta<typeof ToggleButton> = {
  component: ToggleButton,
  args: {
    children: "Toggle me",
    isDisabled: false,
    width: "hug",
  },
};

export default meta;

type Story = StoryObj<typeof ToggleButton>;

export const ToggleButtonStory: Story = {};
