import { Inputs, useForm } from "@povio/ui";
import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ComponentProps } from "react";
import { z } from "zod";

const InputsExampleSchema = z.object({
  text: z.string(),
  textarea: z.string(),
  textEditor: z.string(),
  number: z.number(),
  slider: z.number(),
  select: z.string(),
  multiSelect: z.array(z.string()),
  autocomplete: z.string(),
  multiAutocomplete: z.array(z.string()),
  toggle: z.boolean(),
  checkbox: z.boolean(),
  date: z.iso.datetime(),
  dateTime: z.iso.datetime(),
  time: z.string(),
  dateRange: z.object({
    from: z.iso.datetime(),
    to: z.iso.datetime(),
  }),
});

const meta: Meta<typeof Inputs> = {
  component: Inputs,
  args: {
    inputDefs: [
      {
        type: "textInput",
        name: "text",
        label: "Text Input",
        placeholder: "Enter text...",
      },
      {
        type: "textArea",
        name: "textarea",
        label: "Text Area",
        placeholder: "Enter long text...",
      },
      {
        type: "numberInput",
        name: "number",
        label: "Number Input",
        placeholder: "Enter number...",
      },
      {
        type: "slider",
        name: "slider",
        label: "Slider",
      },
      {
        type: "select",
        name: "select",
        label: "Single Select",
        placeholder: "Choose one option...",
        props: {
          items: [
            {
              id: "option1",
              label: "Option 1",
            },
            {
              id: "option2",
              label: "Option 2",
            },
          ],
          selectionMode: "single",
        },
      },
      {
        type: "select",
        name: "multiSelect",
        label: "Multi Select",
        placeholder: "Choose multiple options...",
        props: {
          items: [
            {
              id: "option1",
              label: "Option 1",
            },
            {
              id: "option2",
              label: "Option 2",
            },
          ],
          selectionMode: "multiple",
        },
      },
      {
        type: "autocomplete",
        name: "autocomplete",
        label: "Autocomplete",
        placeholder: "Search and select...",
        props: {
          items: [
            {
              id: "option1",
              label: "Option 1",
            },
            {
              id: "option2",
              label: "Option 2",
            },
          ],
          selectionMode: "single",
        },
      },
      {
        type: "autocomplete",
        name: "multiAutocomplete",
        label: "Multi Autocomplete",
        placeholder: "Search and select multiple...",
        props: {
          items: [
            {
              id: "option1",
              label: "Option 1",
            },
            {
              id: "option2",
              label: "Option 2",
            },
          ],
          selectionMode: "multiple",
        },
      },
      {
        type: "toggle",
        name: "toggle",
        label: "Toggle Switch",
      },
      {
        type: "checkbox",
        name: "checkbox",
        label: "Checkbox",
      },
      {
        type: "datePicker",
        name: "date",
        label: "Date Picker",
      },
      {
        type: "dateTimePicker",
        name: "dateTime",
        label: "Date Time Picker",
      },
      {
        type: "timePicker",
        name: "time",
        label: "Time Picker",
      },
      {
        type: "dateRangePicker",
        name: "dateRange",
        label: "Date Range Picker",
      },
    ],
  },
};

export default meta;

type Story = StoryObj<typeof Inputs>;

const InputsWrapper = ({ form: _, ...args }: ComponentProps<typeof Inputs>) => {
  const form = useForm({
    zodSchema: InputsExampleSchema,
  });

  return (
    <Inputs
      form={form as unknown as ComponentProps<typeof Inputs>["form"]}
      {...args}
    />
  );
};

export const InputsDefault: Story = {
  render: (args) => <InputsWrapper {...args} />,
};
