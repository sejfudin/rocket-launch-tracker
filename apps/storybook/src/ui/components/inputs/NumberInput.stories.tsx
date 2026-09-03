import { NumberInput } from "@povio/ui";
import type { Meta, StoryObj } from "@storybook/react-vite";

const meta: Meta<typeof NumberInput> = {
  component: NumberInput,
};

export default meta;

type Story = StoryObj<typeof NumberInput>;

export const Default: Story = {
  args: {
    label: "Number",
    isRequired: true,
    // oxlint-disable-next-line no-console
    onChange: (val) => console.log("onChange", val),
    hideLabel: false,
    isClearable: false,
  },
};
