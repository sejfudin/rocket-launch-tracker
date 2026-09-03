import { CellText } from "@povio/ui";
import type { Meta, StoryObj } from "@storybook/react-vite";

const meta: Meta<typeof CellText> = {
  component: CellText,
  args: {
    children: "Lorem ipsum",
  },
};

export default meta;

type Story = StoryObj<typeof CellText>;

export const CellTextDefault: Story = {};

export const CellTextArgs: Story = {
  args: {
    className: "pl-2",
    style: {
      width: "333px",
    },
  },
};
