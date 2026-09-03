import { Modal } from "@povio/ui";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useArgs } from "storybook/preview-api";

const meta: Meta<typeof Modal> = {
  render: function Component(args) {
    const [, setArgs] = useArgs();

    const onClose = () => {
      setArgs({ isOpen: false });
    };

    // Forward all args and overwrite onValueChange
    return (
      <>
        <div className="text-text-default-1">Main content</div>
        <Modal
          {...args}
          onClose={onClose}
        />
      </>
    );
  },
};
export default meta;

type Story = StoryObj<typeof Modal>;

export const Default: Story = {
  args: {
    isOpen: true,
    children: <div className="text-text-default-1">Modal content</div>,
  },
};

export const Tall: Story = {
  args: {
    isOpen: true,
    children: <div className="h-[3000px] text-text-default-1">Modal content</div>,
  },
};

export const Wide: Story = {
  args: {
    isOpen: true,
    children: <div className="w-[1000px] text-text-default-1">Modal content</div>,
  },
};
