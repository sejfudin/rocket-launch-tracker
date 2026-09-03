import { Autocomplete } from "@povio/ui";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useArgs } from "storybook/preview-api";

const meta: Meta<typeof Autocomplete> = {
  render: function Component(args) {
    const [, setArgs] = useArgs();

    // Forward all args and overwrite onValueChange
    return (
      <Autocomplete
        {...args}
        onChange={(value: unknown) => {
          // Call the provided callback
          // This is used for the Actions tab
          // oxlint-disable-next-line typescript-eslint(no-unsafe-argument) no-explicit-any
          args.onChange?.(value as any);

          // Update the arg in Storybook
          setArgs({ value });
        }}
      />
    );
  },
  argTypes: {
    size: {
      control: "radio",
      options: ["extra-small", "small", "default", "large"],
    },
  },
  args: {
    label: "Select Event Type",
    placeholder: "Ex.: Roundtable",
    items: [
      {
        id: "1",
        label: "Roundtable",
      },
      {
        id: "2",
        label: "Conference",
      },
      {
        id: "3",
        label: "Meeting",
      },
      {
        id: "4",
        label: "Party",
      },
      {
        id: "5",
        label:
          "Very long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long event",
      },
      {
        id: "6",
        label: "Disabled item",
        isDisabled: true,
      },
      {
        id: "7",
        label: "Custom label",
        content: (
          <span className="text-text-error-1 group-hover:text-interactive-contained-primary-hover group-focus-visible:text-interactive-contained-primary-on-idle group-selected:text-interactive-contained-primary-on-idle">
            Custom label
          </span>
        ),
      },
    ],
    size: "default",
    hideDropdownIcon: false,
    isClearable: false,
    isClientSearchDisabled: false,
    // oxlint-disable-next-line no-console
    onChange: (val: unknown) => console.log("onChange", val),
  },
};

export default meta;

type Story = StoryObj<typeof Autocomplete>;

export const Default: Story = {
  args: {},
};

export const Multiple: Story = {
  args: {
    selectionMode: "multiple",
    value: [],
    showSelectionBar: true,
    showSelectAllOption: true,
  },
};

export const WithNewOption: Story = {
  args: {
    showNewItemOption: true,
    // oxlint-disable-next-line no-console
    onNewItemOption: (value: string) => console.log("onNewItemOption", value),
  },
};

export const HiddenLabel: Story = {
  args: {
    hideLabel: true,
  },
};

export const Inline: Story = {
  args: {
    as: "inline",
  },
};

export const Disabled: Story = {
  args: {
    isDisabled: true,
  },
};

export const Error: Story = {
  args: {
    error: "This is an error message",
  },
};
