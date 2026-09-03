import { HeaderText } from "@povio/ui";
import type { Meta, StoryObj } from "@storybook/react-vite";

const meta: Meta<typeof HeaderText> = {
  component: HeaderText,
  args: {
    children: "Lorem ipsum",
  },
};

export default meta;

type Story = StoryObj<typeof HeaderText>;

export const HeaderTextDefault: Story = {};
