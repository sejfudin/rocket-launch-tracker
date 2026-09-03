import { CalendarIcon, PillButton } from "@povio/ui";
import type { Meta, StoryObj } from "@storybook/react-vite";

const meta: Meta<typeof PillButton> = {
  component: PillButton,
  args: {
    children: "Log in",
  },
};

export default meta;

type Story = StoryObj<typeof PillButton>;

export const PillButtonStory: Story = {};

export const IconPillButtonStory: Story = {
  args: {
    icon: CalendarIcon,
  },
};
