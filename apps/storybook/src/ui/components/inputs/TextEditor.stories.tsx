import { TextEditor } from "@povio/ui/text-editor";
import type { Meta, StoryObj } from "@storybook/react-vite";

const meta: Meta<typeof TextEditor> = {
  component: TextEditor,
};

export default meta;

type Story = StoryObj<typeof TextEditor>;

export const Default: Story = {
  args: {
    // oxlint-disable-next-line no-console
    onChange: (content) => console.log("RTE Change", content),
    placeholder: "Enter your text",
    className: "text-text-default-1",
    editorClassName: "max-h-80",
  },
};

export const Floating: Story = {
  args: {
    label: "First name",
    as: "floating",
    className: "text-text-default-1",
  },
};
