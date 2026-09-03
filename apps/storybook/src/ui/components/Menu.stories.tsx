import { IconButton, Menu, MenuIcon, PillButton } from "@povio/ui";
import type { Meta, StoryObj } from "@storybook/react-vite";

const meta: Meta<typeof Menu> = {
  component: Menu,
  args: {
    triggerOnHover: false,
    items: [
      { label: "Profile", href: "https://www.google.com", target: "_blank" },
      {
        content: <span className="text-text-error-1">Some other text</span>,
        label: "Some other text",
        className: "focus-visible:!bg-elevation-fill-default-2",
      },
      {
        label: "Disabled item",
        isDisabled: true,
      },
    ],
  },
};

export default meta;

type Story = StoryObj<typeof Menu>;

export const Default: Story = {
  args: {
    trigger: <PillButton>Open menu</PillButton>,
  },
};

export const WithIconButton: Story = {
  args: {
    trigger: (
      <IconButton
        icon={MenuIcon}
        label="Menu"
      />
    ),
  },
};

export const Nested: Story = {
  args: {
    trigger: <PillButton>Open menu</PillButton>,
    items: [
      { label: "Profile", href: "https://www.google.com", target: "_blank" },
      {
        content: <span className="text-text-error-1">Some other text</span>,
        label: "Some other text",
        className: "focus-visible:!bg-elevation-fill-default-2",
      },
      {
        label: "Disabled item",
        isDisabled: true,
      },
      {
        label: "Submenu",
        children: [
          {
            label: "Submenu item 1",
            children: [
              { label: "Submenu item 1.1 - Disabled", isDisabled: true },
              { label: "Submenu item 1.2" },
              { label: "Submenu item 1.3" },
            ],
          },
          {
            label: "Submenu item 2 - Disabled",
            children: [{ label: "Submenu item 2.1" }, { label: "Submenu item 2.2" }, { label: "Submenu item 2.3" }],
            isDisabled: true,
          },
          { label: "Submenu item 3" },
        ],
      },
    ],
  },
};
