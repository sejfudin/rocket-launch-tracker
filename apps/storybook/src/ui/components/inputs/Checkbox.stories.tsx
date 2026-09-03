import { ArrowRightIcon, CheckIcon, Checkbox } from "@povio/ui";
import type { Meta, StoryObj } from "@storybook/react-vite";

const meta: Meta<typeof Checkbox> = {
  component: Checkbox,
};

export default meta;

type Story = StoryObj<typeof Checkbox>;

export const Default: Story = {
  args: {
    children: "Option 1",
    // oxlint-disable-next-line no-console
    onChange: (val) => console.log("onChange", val),
  },
};

export const Disabled: Story = {
  args: {
    ...Default.args,
    isDisabled: true,
  },
};

export const Error: Story = {
  args: {
    children: "Option 1",
    error: "This is an error message",
  },
};

export const CustomCheckmark: Story = {
  args: {
    ...Default.args,
    children: "Option 1",
    selectedIcon: ArrowRightIcon,
    indeterminateIcon: CheckIcon,
  },
};

export const CustomLabel: Story = {
  args: {
    children: (
      <div className="flex items-center gap-1">
        Option 1 <CheckIcon className="size-4" />
      </div>
    ),
  },
};
