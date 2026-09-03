import { Button, ResponsivePopover } from "@povio/ui";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";

const ResponsivePopoverStory = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <ResponsivePopover
      trigger={<Button>Open</Button>}
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      sheetLabel="Responsive Popover"
      popoverClassName="w-80"
    >
      <div className="text-text-default-1">Content</div>
    </ResponsivePopover>
  );
};

const meta: Meta<typeof ResponsivePopoverStory> = {
  component: ResponsivePopoverStory,
};

export default meta;

type Story = StoryObj<typeof ResponsivePopoverStory>;

export const Default: Story = {
  args: {},
};
