import { FormField } from "@povio/ui";
import type { Meta, StoryObj } from "@storybook/react-vite";

const meta: Meta<typeof FormField> = {
  component: FormField,
  args: {
    label: "{label}",
    tooltipText: "{tooltipText}",
    helperText: "{helperText}",
    isRequired: true,
    rightContent: <div>&#123;rightContent&#125;</div>,
    error: "{error}",
    children: (
      <div className="flex h-8 w-full items-center justify-center rounded-input-rounding-default bg-elevation-fill-default-2">
        &#123;children&#125;
      </div>
    ),
  },
};

export default meta;

type Story = StoryObj<typeof FormField>;

export const Default: Story = {
  args: {},
};
