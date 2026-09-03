import { SplitButton } from "@povio/ui";
import type { Meta, StoryObj } from "@storybook/react-vite";

const meta: Meta<typeof SplitButton> = {
  component: SplitButton,
};

export default meta;

type Story = StoryObj<typeof SplitButton>;

export const SplitButtonStory: Story = {
  args: {
    label: "Split Button",
    labelRight: "More",
    items: [
      {
        label: "Item 1",
        onAction: () => {},
      },
      {
        label: "Item 2",
        onAction: () => {},
      },
      {
        label: "Item 3",
        isDisabled: true,
        onAction: () => {},
      },
    ],
  },
};
