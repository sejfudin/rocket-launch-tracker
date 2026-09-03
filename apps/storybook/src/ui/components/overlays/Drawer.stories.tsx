import { Button, Drawer } from "@povio/ui";
import type { Meta, StoryObj } from "@storybook/react-vite";

const meta: Meta<typeof Drawer> = {
  component: Drawer,
};

export default meta;

type Story = StoryObj<typeof Drawer>;

export const Default: Story = {
  args: {
    trigger: <Button>Open Drawer</Button>,
    children: (close) => (
      <div className="flex h-full w-80 flex-col items-center justify-center">
        <button
          type="button"
          onClick={close}
          className="text-text-default-1"
        >
          Close Drawer
        </button>
      </div>
    ),
  },
};
