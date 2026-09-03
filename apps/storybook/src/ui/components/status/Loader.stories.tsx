import { Loader } from "@povio/ui";
import type { Meta, StoryObj } from "@storybook/react-vite";

const meta: Meta<typeof Loader> = {
  component: Loader,
  args: {
    size: "default",
  },
};

export default meta;

type Story = StoryObj<typeof Loader>;

export const Default: Story = {};
