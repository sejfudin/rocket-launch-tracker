import { CalendarIcon, InlineIconButton } from "@povio/ui";
import type { Meta, StoryObj } from "@storybook/react-vite";

const meta: Meta<typeof InlineIconButton> = {
  component: InlineIconButton,
  args: {
    icon: CalendarIcon,
  },
};

export default meta;

type Story = StoryObj<typeof InlineIconButton>;

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

export const IconCustomSize: Story = {
  args: {
    icon: <CalendarIcon className="size-4" />,
  },
};
