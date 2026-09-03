import type { SegmentProps } from "@povio/ui";
import { CalendarIcon, Segment, SendIcon } from "@povio/ui";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useArgs } from "storybook/preview-api";

const meta: Meta<SegmentProps<string>> = {
  component: Segment,
  render: function Component(args: SegmentProps<string>) {
    const [, setArgs] = useArgs();

    const onValueChange = (value: typeof args.value) => {
      // oxlint-disable-next-line @typescript-eslint/no-unsafe-argument no-explicit-any
      args.onChange?.(value as any);

      // Update the arg in Storybook
      setArgs({ value });
    };

    return (
      <Segment
        {...args}
        onChange={onValueChange}
      />
    );
  },
  args: {
    items: [
      {
        id: "option1",
        label: "Option 1",
      },
      {
        id: "option2",
        label: "Option 2",
      },
      {
        id: "option3",
        label: "Option 3",
      },
    ],
    selectionMode: "single",
    // oxlint-disable-next-line no-console
    onChange: (keys: string | null) => console.log("onChange", keys),
  },
};

export default meta;

type Story = StoryObj<SegmentProps<string>>;

export const Default: Story = {
  args: {},
};

export const WithIcons: Story = {
  args: {
    items: [
      {
        id: "calendar",
        label: "Calendar",
        icon: CalendarIcon,
      },
      {
        id: "send",
        label: "Send",
        icon: SendIcon,
      },
      {
        id: "option3",
        label: "Option 3",
        icon: CalendarIcon,
      },
    ],
    defaultValue: "calendar",
  },
};

export const IconsOnly: Story = {
  args: {
    items: [
      {
        id: "calendar",
        icon: CalendarIcon,
      },
      {
        id: "send",
        icon: SendIcon,
      },
      {
        id: "option3",
        icon: CalendarIcon,
      },
    ],
    defaultValue: "send",
  },
};

export const ManyOptions: Story = {
  args: {
    items: [
      {
        id: "option1",
        label: "Option 1",
      },
      {
        id: "option2",
        label: "Option 2",
      },
      {
        id: "option3",
        label: "Option 3",
      },
      {
        id: "option4",
        label: "Option 4",
      },
      {
        id: "option5",
        label: "Option 5",
      },
    ],
    selectionMode: "multiple",
  },
};

export const DisabledItems: Story = {
  args: {
    items: [
      {
        id: "option1",
        label: "Enabled",
      },
      {
        id: "option2",
        label: "Disabled",
        isDisabled: true,
      },
      {
        id: "option3",
        label: "Enabled",
      },
    ],
    value: "option1",
  },
};

export const Error: Story = {
  args: {
    error: "This is an error message",
    value: "option2",
  },
};

export const TwoOptions: Story = {
  args: {
    items: [
      {
        id: "yes",
        label: "Yes",
      },
      {
        id: "no",
        label: "No",
      },
    ],
    defaultValue: "yes",
    value: undefined,
  },
};
