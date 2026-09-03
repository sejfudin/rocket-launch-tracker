import { Button, Confirmation, Typography } from "@povio/ui";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { type ReactNode, useState } from "react";

// Component that demonstrates the useConfirmation hook
const ConfirmationDemo = () => {
  const { confirm } = Confirmation.useConfirmation();
  const [result, setResult] = useState<string>("");

  const handleBasicConfirmation = async () => {
    const confirmed = await confirm({
      heading: "Delete Item",
      description: "Are you sure you want to delete this item? This action cannot be undone.",
    });
    setResult(confirmed ? "User confirmed the action" : "User cancelled the action");
  };

  const handleDangerConfirmation = async () => {
    const confirmed = await confirm({
      heading: "Permanently Delete Account",
      description: "This will permanently delete your account and all associated data. This action cannot be undone.",
      confirmColor: "error",
      confirmLabel: "Delete Account",
      cancelLabel: "Cancel",
    });
    setResult(confirmed ? "User confirmed account deletion" : "User cancelled account deletion");
  };

  const handleSuccessConfirmation = async () => {
    const confirmed = await confirm({
      heading: "Publish Changes",
      description: "Your changes are ready to be published. This will make them visible to all users.",
      confirmColor: "success",
      confirmLabel: "Publish",
      cancelLabel: "Review Later",
    });
    setResult(confirmed ? "User confirmed publishing" : "User chose to review later");
  };

  const handleWarningConfirmation = async () => {
    const confirmed = await confirm({
      heading: "Override Settings",
      description: "This will override your current settings. Some features may be affected.",
      confirmColor: "warning",
      confirmLabel: "Override",
      cancelLabel: "Keep Current",
    });
    setResult(confirmed ? "User confirmed override" : "User kept current settings");
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <Typography
        size="title-3"
        variant="prominent-1"
      >
        useConfirmation Hook
      </Typography>

      <Typography size="body-2">
        This demonstrates how to use the useConfirmation context to show confirmation dialogs. Each button below will
        trigger a different type of confirmation dialog.
      </Typography>

      <pre className="rounded-lg bg-elevation-fill-default-2 p-4">
        <Typography
          size="body-2"
          variant="prominent-2"
          className="mb-2"
        >
          Usage:
        </Typography>
        <code>
          {`const {confirm} = useConfirmation();
...
const confirmed = await confirm({
    heading: "Delete Item",
    description: "Are you sure you want to delete this item? This action cannot be undone."
});`}
        </code>
      </pre>

      <pre className="rounded-lg bg-elevation-fill-default-2 p-4">
        <Typography
          size="body-2"
          variant="prominent-2"
          className="mb-2"
        >
          Example:
        </Typography>
        <div className="flex flex-row gap-4">
          <Button
            onPress={handleBasicConfirmation}
            color="primary"
            size="s"
            width="hug"
          >
            Basic Confirmation
          </Button>

          <Button
            onPress={handleDangerConfirmation}
            color="error"
            size="s"
            width="hug"
          >
            Danger Confirmation
          </Button>

          <Button
            onPress={handleSuccessConfirmation}
            color="success"
            size="s"
            width="hug"
          >
            Success Confirmation
          </Button>

          <Button
            onPress={handleWarningConfirmation}
            color="warning"
            size="s"
            width="hug"
          >
            Warning Confirmation
          </Button>
        </div>
      </pre>

      {result && (
        <div className="rounded-lg bg-elevation-fill-default-2 p-4">
          <Typography
            size="body-2"
            variant="prominent-2"
            className="mb-2"
          >
            Last Result:
          </Typography>
          <Typography size="body-3">{result}</Typography>
        </div>
      )}
    </div>
  );
};

// Wrapper component that provides the Confirmation context
const ConfirmationWrapper = ({ children }: { children: ReactNode }) => {
  return <Confirmation.Provider>{children}</Confirmation.Provider>;
};

const meta: Meta<typeof ConfirmationDemo> = {
  title: "UI/Hooks/useConfirmation",
  component: ConfirmationDemo,
  decorators: [
    (Story) => (
      <ConfirmationWrapper>
        <Story />
      </ConfirmationWrapper>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof ConfirmationDemo>;

export const Default: Story = {
  args: {},
};
