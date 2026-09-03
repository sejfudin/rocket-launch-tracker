import { CalendarIcon, SendIcon, TextInput } from "@povio/ui";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useArgs } from "storybook/preview-api";

const meta: Meta<typeof TextInput> = {
  component: TextInput,
  render: function Component(args) {
    const [, setArgs] = useArgs();

    const onValueChange = (value: typeof args.value) => {
      args.onChange?.(value as any);
      setArgs({ value });
    };

    return (
      <TextInput
        {...args}
        onChange={onValueChange}
      />
    );
  },
};

export default meta;

type Story = StoryObj<typeof TextInput>;

export const Default: Story = {
  args: {
    label: "First name",
    placeholder: "Enter your name",
    isRequired: true,
    tooltipText: "Additional helper information",
    helperText: "This is a helper text",
    // oxlint-disable-next-line no-console
    onChange: (val) => console.log("onChange", val),
    hideLabel: false,
    isClearable: false,
    variant: "outlined",
    isDisabled: false,
  },
};

export const Truncation: Story = {
  args: {
    label: "Long long long long long Long long long long long Long long long long long Long long long long long name",
    isRequired: true,
    tooltipText: "Additional helper information",
    helperText: "This is a helper text",
  },
};

export const Filled: Story = {
  args: {
    variant: "filled",
    label: "First name",
    isRequired: true,
    tooltipText: "Additional helper information",
    helperText: "This is a helper text",
  },
};

export const Inline: Story = {
  args: {
    as: "inline",
    placeholder: "Enter ID number",
    label: "ID number",
  },
};

export const Filter: Story = {
  args: {
    as: "filter",
    placeholder: "Search by name",
    label: "Search",
  },
};

export const Floating: Story = {
  args: {
    as: "floating",
    placeholder: "Search by name",
    label: "Search",
  },
};

export const HiddenLabel: Story = {
  args: {
    ...Default.args,
    hideLabel: true,
  },
};

export const LeadingIcon: Story = {
  args: {
    ...Default.args,
    leadingIcon: CalendarIcon,
  },
};

export const TrailingIcon: Story = {
  args: {
    ...Default.args,
    trailingIcon: CalendarIcon,
  },
};

export const Error: Story = {
  args: {
    label: "First name",
    isRequired: true,
    tooltipText: "Additional helper information",
    helperText: "This is a helper text",
    error: "This is an error message",
  },
};

export const Disabled: Story = {
  args: {
    label: "First name",
    value: "John",
    isRequired: true,
    tooltipText: "Additional helper information",
    helperText: "This is a helper text",
    isDisabled: true,
  },
};

export const Unit: Story = {
  args: {
    label: "First name",
    isRequired: true,
    tooltipText: "Additional helper information",
    helperText: "This is a helper text",
    error: "This is an error message",
    unit: "USD",
  },
};

export const Loading: Story = {
  args: {
    label: "First name",
    isRequired: true,
    tooltipText: "Additional helper information",
    helperText: "This is a helper text",
    error: "This is an error message",
    isLoading: true,
  },
};

export const Action: Story = {
  args: {
    label: "First name",
    isRequired: true,
    tooltipText: "Additional helper information",
    helperText: "This is a helper text",
    error: "This is an error message",
    action: {
      icon: SendIcon,
      onClick: () => {},
      altText: "Send",
    },
  },
};

export const Clearable: Story = {
  args: {
    ...Default.args,
    isClearable: true,
  },
};
