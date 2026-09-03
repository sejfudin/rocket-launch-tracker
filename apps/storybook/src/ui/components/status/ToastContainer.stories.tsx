import { Button, CheckIcon, type ToastAction, ToastContainer, type ToastVariantProps, useToast } from "@povio/ui";
import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ToastPosition } from "react-toastify";

interface ToastConsumerProps {
  position: ToastPosition;
  actions?: ToastAction[];
  variant: ToastVariantProps["variant"];
}

export const ToastStory = ({ actions, position, variant }: ToastConsumerProps) => {
  return (
    <>
      <ToastContainer />
      <ToastConsumer
        position={position}
        actions={actions}
        variant={variant}
      />
    </>
  );
};

const ToastConsumer = ({ position, actions, variant }: ToastConsumerProps) => {
  const { successToast, errorToast, neutralToast, warningToast } = useToast();

  return (
    <div className="flex flex-col gap-2">
      <Button
        onPress={() =>
          successToast({
            icon: CheckIcon,
            text: "This is a default sample of text, in order to display the default.",
            position,
            variant,
            actions,
          })
        }
      >
        Success
      </Button>
      <Button
        onPress={() =>
          errorToast({
            icon: CheckIcon,
            text: "This is a default sample of text, in order to display the default.",
            position,
            variant,
            actions,
          })
        }
      >
        Error
      </Button>
      <Button
        onPress={() =>
          neutralToast({
            icon: CheckIcon,
            text: "This is a default sample of text, in order to display the default.",
            position,
            variant,
            actions,
          })
        }
      >
        Neutral
      </Button>
      <Button
        onPress={() =>
          warningToast({
            icon: CheckIcon,
            text: "This is a default sample of text, in order to display the default.",
            position,
            variant,
            actions,
          })
        }
      >
        Warning
      </Button>
    </div>
  );
};

const meta: Meta<typeof ToastStory> = {
  component: ToastStory,
  args: {
    position: "top-right",
    variant: "outlined",
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

export default meta;

type Story = StoryObj<typeof ToastStory>;

export const Default: Story = {};

export const Contained: Story = {
  args: {
    variant: "contained",
  },
};
