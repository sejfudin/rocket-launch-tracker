import { Alert, type ButtonVariantProps, CheckIcon, InlineIconButton, LinkIcon, TextButton } from "@povio/ui";
import type { Meta, StoryObj } from "@storybook/react-vite";

const meta: Meta<typeof Alert> = {
  component: Alert,
  args: {},
};

export default meta;

type Story = StoryObj<typeof Alert>;

export const Default: Story = {
  args: {
    text: "This is a default sample of text, in order to display the default.",
    icon: CheckIcon,
  },
};

export const NoIcon: Story = {
  args: {
    text: "This is a default sample of text, in order to display the default.",
  },
};

export const RightContentActions: Story = {
  args: {
    text: "This is a default sample of text, in order to display the default.",
    icon: CheckIcon,
    hasSeparator: true,
  },
  render: (args) => {
    const color = args.color !== "neutral" ? (args.color as ButtonVariantProps["color"]) : "secondary";
    return (
      <Alert
        {...args}
        rightContent={
          <>
            <TextButton
              onPress={() => {}}
              color={color}
              inverted={args.variant === "contained"}
            >
              Action 1
            </TextButton>
            <TextButton
              onPress={() => {}}
              color={color}
              inverted={args.variant === "contained"}
            >
              Action 2
            </TextButton>
          </>
        }
      />
    );
  },
};

export const RightContentLink: Story = {
  args: {
    text: "This is a default sample of text, in order to display the default.",
    icon: CheckIcon,
  },
  render: (args) => {
    const color = args.color !== "neutral" ? (args.color as ButtonVariantProps["color"]) : "secondary";
    return (
      <Alert
        {...args}
        rightContent={
          <InlineIconButton
            color={color}
            inverted={args.variant === "contained"}
            label="Link"
            icon={LinkIcon}
          />
        }
      />
    );
  },
};

export const Loading: Story = {
  args: {
    text: "This is a default sample of text, in order to display the default.",
    isLoading: true,
    icon: CheckIcon,
  },
};
