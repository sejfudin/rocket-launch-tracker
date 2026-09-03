import { CheckIcon, RadioGroup } from "@povio/ui";
import type { Meta, StoryObj } from "@storybook/react-vite";

const meta: Meta<typeof RadioGroup> = {
  component: RadioGroup,
};

export default meta;

type Story = StoryObj<typeof RadioGroup>;

export const Default: Story = {
  args: {
    label: "Radio Group",
    options: [
      { label: "Option 1", value: "option-1" },
      { label: "Option 2", value: "option-2" },
      { label: "Option 3", value: "option-3" },
    ],
    // oxlint-disable-next-line no-console
    onChange: (val) => console.log("onChange", val),
  },
};

export const HiddenLabel: Story = {
  args: {
    ...Default.args,
    hideLabel: true,
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
    ...Default.args,
    error: "This is an error message",
  },
};

export const CustomLabel: Story = {
  args: {
    label: "Radio Group",
    options: [
      {
        label: (
          <div className="flex items-center gap-1">
            Option 1 <CheckIcon className="size-4" />
          </div>
        ),
        value: "option-1",
      },
      {
        label: (
          <div className="flex items-center gap-1">
            Option 2 <CheckIcon className="size-4" />
          </div>
        ),
        value: "option-2",
      },
      {
        label: (
          <div className="flex items-center gap-1">
            Option 3 <CheckIcon className="size-4" />
          </div>
        ),
        value: "option-3",
      },
    ],
    // oxlint-disable-next-line no-console
    onChange: (val) => console.log("onChange", val),
  },
};
