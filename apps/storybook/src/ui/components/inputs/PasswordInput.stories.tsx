import { PasswordInput } from "@povio/ui";
import type { Meta, StoryObj } from "@storybook/react-vite";

const meta: Meta<typeof PasswordInput> = {
  component: PasswordInput,
};

export default meta;

type Story = StoryObj<typeof PasswordInput>;

export const Default: Story = {
  args: {
    label: "Password",
    isRequired: true,
    // oxlint-disable-next-line no-console
    onChange: (val) => console.log("onChange", val),
    hideLabel: false,
    isClearable: false,
  },
};
