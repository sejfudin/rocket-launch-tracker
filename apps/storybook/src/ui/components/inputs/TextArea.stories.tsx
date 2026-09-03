import { TextArea } from "@povio/ui";
import type { Meta, StoryObj } from "@storybook/react-vite";

const meta: Meta<typeof TextArea> = {
  component: TextArea,
};

export default meta;

type Story = StoryObj<typeof TextArea>;

export const Default: Story = {
  args: {
    label: "First name",
    isRequired: true,
    tooltipText: "Additional helper information",
    helperText: "This is a helper text",
    // oxlint-disable-next-line no-console
    onChange: (val) => console.log("onChange", val),
    hideLabel: false,
    isClearable: false,
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
    label: "First name",
    value: "John",
    isRequired: true,
    tooltipText: "Additional helper information",
    helperText: "This is a helper text",
    isDisabled: true,
  },
};

export const Floating: Story = {
  args: {
    label: "First name",
    as: "floating",
  },
};
