import { CheckIcon, Toast } from "@povio/ui";
import type { Meta, StoryObj } from "@storybook/react-vite";

const meta: Meta<typeof Toast> = {
  component: Toast,
  args: {},
};

export default meta;

type Story = StoryObj<typeof Toast>;

export const Default: Story = {
  args: {
    variant: "outlined",
    color: "neutral",
    text: "This is a default sample of text, in order to display the default.",
    icon: CheckIcon,
    actions: [
      {
        text: "Action 1",
        onPress: () => {},
      },
      {
        text: "Action 2",
        onPress: () => {},
      },
    ],
  },
};

export const NoActions: Story = {
  args: {
    text: "This is a default sample of text, in order to display the default.",
    icon: CheckIcon,
  },
};

export const NoIcon: Story = {
  args: {
    text: "This is a default sample of text, in order to display the default.",
    actions: [
      {
        text: "Action 1",
        onPress: () => {},
      },
      {
        text: "Action 2",
        onPress: () => {},
      },
    ],
  },
};

export const Loading: Story = {
  args: {
    text: "This is a default sample of text, in order to display the default.",
    isLoading: true,
    icon: CheckIcon,
  },
};
