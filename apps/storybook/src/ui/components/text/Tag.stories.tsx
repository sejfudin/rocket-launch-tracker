import { Tag } from "@povio/ui";
import type { Meta, StoryObj } from "@storybook/react-vite";

const meta: Meta<typeof Tag> = {
  component: Tag,
  args: {
    color: "primary",
    children: "Log in",
    onDismiss: () => {
      // oxlint-disable-next-line no-console
      console.log("onDismiss");
    },
  },
};

export default meta;

type Story = StoryObj<typeof Tag>;

export const Default: Story = {};
