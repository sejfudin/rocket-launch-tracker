import { Button, CalendarIcon } from "@povio/ui";
import type { Meta, StoryObj } from "@storybook/react-vite";

const meta: Meta<typeof Button> = {
  component: Button,
  args: {
    children: "Click  me!",
    width: "hug",
    size: "l",
    isDisabled: false,
  },
};

export default meta;

type Story = StoryObj<typeof Button>;

export const BasicButtonStory: Story = {};

export const IconButtonStory: Story = {
  args: {
    icon: CalendarIcon,
  },
};

export const LinkButtonStory: Story = {
  args: {
    link: {
      href: "https://example.com",
    },
  },
};
