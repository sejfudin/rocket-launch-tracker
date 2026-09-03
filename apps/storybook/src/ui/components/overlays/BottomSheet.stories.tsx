import { BottomSheet, Button } from "@povio/ui";
import type { Meta, StoryObj } from "@storybook/react-vite";

const meta: Meta<typeof BottomSheet> = {
  component: BottomSheet,
  args: {
    trigger: <Button>Open Sheet</Button>,
    // oxlint-disable-next-line no-console
    onOpenChange: (open) => console.log("onOpenChange", open),
    // oxlint-disable-next-line no-console
    onStateChange: (state) => console.log("onStateChange", state),
    children: (close) => (
      <div className="flex h-full flex-col items-center justify-center">
        <button
          type="button"
          onClick={close}
          className="text-text-default-1"
        >
          Close Sheet
        </button>
      </div>
    ),
  },
};

export default meta;

type Story = StoryObj<typeof BottomSheet>;

export const Default: Story = {};

export const Dismissable: Story = {
  args: {
    isDismissable: true,
  },
};

export const AutoHeight: Story = {
  args: {
    height: "auto",
  },
};
