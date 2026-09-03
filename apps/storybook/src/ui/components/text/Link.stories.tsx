import { Link } from "@povio/ui";
import type { Meta, StoryObj } from "@storybook/react-vite";

const meta: Meta<typeof Link> = {
  component: Link,
  args: {
    children: "A link",
    href: "https://google.com",
  },
};

export default meta;

type Story = StoryObj<typeof Link>;

export const Default: Story = {};
