import { CalendarIcon, IconButton } from "@povio/ui";
import type { Meta, StoryObj } from "@storybook/react-vite";

const meta: Meta<typeof IconButton> = {
  component: IconButton,
  args: {
    icon: CalendarIcon,
    size: "m",
    variant: "contained",
    color: "primary",
  },
};

export default meta;

type Story = StoryObj<typeof IconButton>;

export const IconButtonStory: Story = {
  args: {
    icon: CalendarIcon,
  },
};

export const IconLinkButtonStory: Story = {
  args: {
    icon: CalendarIcon,
    link: {
      href: "https://example.com",
    },
  },
};

export const IconCustomSze: Story = {
  args: {
    icon: <CalendarIcon className="size-4" />,
  },
};
