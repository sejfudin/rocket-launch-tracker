import { CalendarIcon, TextButton } from "@povio/ui";
import type { Meta, StoryObj } from "@storybook/react-vite";

const meta: Meta<typeof TextButton> = {
  component: TextButton,
};

export default meta;

type Story = StoryObj<typeof TextButton>;

export const TextButtonStory: Story = {
  args: {
    children: "Log in",
  },
};

export const TextIconButtonStory: Story = {
  args: {
    children: "Log in",
    icon: CalendarIcon,
  },
};

export const TextLinkButtonStory: Story = {
  args: {
    children: "Log in",
    icon: CalendarIcon,
    link: {
      href: "https://example.com",
    },
  },
};
