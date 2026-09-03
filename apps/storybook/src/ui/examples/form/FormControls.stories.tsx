import {
  Autocomplete,
  Button,
  Checkbox,
  DatePicker,
  DateRangePicker,
  DateTimePicker,
  InputUpload,
  type InputVariantProps,
  NumberInput,
  PasswordInput,
  RadioGroup,
  Segment,
  Select,
  Slider,
  TextArea,
  TextInput,
  TimePicker,
  Toggle,
  useForm,
} from "@povio/ui";
import { TextEditor } from "@povio/ui/text-editor";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { z } from "zod";

enum OptionEnum {
  Option1 = "option-1",
  Option2 = "option-2",
  Option3 = "option-3",
}

const FormSchema = z.object({
  input: z.string(),
  numberInput: z.number(),
  textArea: z.string(),
  password: z.string(),
  selectSingleMode: z.enum(OptionEnum),
  selectMultipleMode: z.array(z.enum(OptionEnum)),
  autocompleteSingleMode: z.enum(OptionEnum),
  autocompleteMultipleMode: z.array(z.enum(OptionEnum)),
  slider: z.number(),
  rangeSlider: z.array(z.number()),
  checkbox: z.boolean(),
  toggle: z.boolean(),
  radioGroup: z.enum(OptionEnum),
  date: z.string(),
  dateRange: z.object({ start: z.iso.datetime({ offset: true }).nullable(), end: z.iso.datetime().nullable() }),
  time: z.string(),
  dateTime: z.string(),
  textEditor: z.object({ html: z.string().optional(), json: z.record(z.string(), z.any()) }),
  segmentSingleMode: z.enum(OptionEnum),
  segmentMultipleMode: z.array(z.enum(OptionEnum)),
  inputUpload: z.array(z.instanceof(File)),
});
type FormType = z.infer<typeof FormSchema>;

const options = [
  { id: OptionEnum.Option1, label: "Option 1" },
  { id: OptionEnum.Option2, label: "Option 2" },
];

const segmentDualOptions = [
  { id: OptionEnum.Option1, label: "Option 1" },
  { id: OptionEnum.Option2, label: "Option 2" },
];

const segmentOptions = [
  { id: OptionEnum.Option1, label: "Option 1" },
  { id: OptionEnum.Option2, label: "Option 2" },
  { id: OptionEnum.Option3, label: "Option 3" },
];

interface Props {
  variant: InputVariantProps["variant"];
  as: InputVariantProps["as"];
  defaultValues?: FormType;
  disabled?: boolean;
  isClearable?: boolean;
}

const FormStory = ({ variant, as, defaultValues, disabled, isClearable }: Props) => {
  const { control, handleSubmit, reset } = useForm({
    zodSchema: FormSchema,
    defaultValues,
    disabled,
  });

  const onSubmit = (values: FormType) => {
    // oxlint-disable-next-line no-console
    console.log("onSubmit", values);
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-4"
    >
      <TextInput
        formControl={{ control, name: "input" }}
        label="Input label"
        placeholder="Input placeholder"
        isClearable={isClearable}
        variant={variant}
        as={as}
      />

      <NumberInput
        formControl={{ control, name: "numberInput" }}
        label="Number input label"
        placeholder="Number input placeholder"
        isClearable={isClearable}
        variant={variant}
        as={as}
      />

      <TextArea
        formControl={{ control, name: "textArea" }}
        label="TextArea label"
        placeholder="TextArea placeholder"
        isClearable={isClearable}
        variant={variant}
        as={as}
      />

      <PasswordInput
        formControl={{ control, name: "password" }}
        label="Password label"
        placeholder="Password placeholder"
        isClearable={isClearable}
        variant={variant}
        as={as}
      />

      <Select
        formControl={{ control, name: "selectSingleMode" }}
        label="Select single mode label"
        placeholder="Select option..."
        items={options}
        isClearable={isClearable}
        variant={variant}
        as={as}
      />

      <Select
        formControl={{ control, name: "selectMultipleMode" }}
        selectionMode="multiple"
        label="Select multiple mode label"
        placeholder="Select option..."
        items={options}
        isClearable={isClearable}
        variant={variant}
        as={as}
      />

      <Autocomplete
        formControl={{ control, name: "autocompleteSingleMode" }}
        label="Autocomplete single mode label"
        placeholder="Select option..."
        items={options}
        isClearable={isClearable}
        variant={variant}
        as={as}
      />

      <Autocomplete
        formControl={{ control, name: "autocompleteMultipleMode" }}
        selectionMode="multiple"
        label="Autocomplete multiple mode label"
        placeholder="Select option..."
        items={options}
        isClearable={isClearable}
        variant={variant}
        as={as}
      />

      <Slider
        formControl={{ control, name: "slider" }}
        label="Percentage"
        unit="%"
      />

      <Slider
        isRange
        formControl={{ control, name: "rangeSlider" }}
        label="Range"
        unit="%"
      />

      <Checkbox formControl={{ control, name: "checkbox" }}>Checkbox text</Checkbox>

      <Toggle formControl={{ control, name: "toggle" }}>Toggle text</Toggle>

      <RadioGroup
        formControl={{ control, name: "radioGroup" }}
        label="RadioGroup label"
        options={[
          { value: OptionEnum.Option1, label: "Option 1" },
          { value: OptionEnum.Option2, label: "Option 2" },
        ]}
      />

      <DatePicker
        formControl={{ control, name: "date" }}
        label="DatePicker label"
        isClearable={isClearable}
        variant={variant}
        as={as}
      />

      <DateRangePicker
        formControl={{ control, name: "dateRange" }}
        label="DateRangePicker label"
        isClearable={isClearable}
        variant={variant}
        as={as}
      />

      <TimePicker
        formControl={{ control, name: "time" }}
        label="TimePicker label"
        isClearable={isClearable}
        variant={variant}
        as={as}
      />

      <DateTimePicker
        formControl={{ control, name: "dateTime" }}
        label="DateTimePicker label"
        isClearable={isClearable}
        variant={variant}
        as={as}
      />

      <TextEditor
        label="TextEditor label"
        formControl={{ control, name: "textEditor" }}
        as={as}
      />

      <Segment
        formControl={{ control, name: "segmentSingleMode" }}
        items={segmentDualOptions}
      />

      <Segment
        formControl={{ control, name: "segmentMultipleMode" }}
        items={segmentOptions}
        selectionMode="multiple"
      />

      <InputUpload
        formControl={{ control, name: "inputUpload" }}
        allowsMultiple
        label="InputUpload label"
      />

      <div className="flex gap-4">
        <Button type="submit">Submit</Button>
        <Button
          color="secondary"
          onPress={() => reset()}
        >
          Reset
        </Button>
      </div>
    </form>
  );
};

const meta: Meta<typeof FormStory> = {
  argTypes: {
    variant: {
      options: ["outlined", "filled"],
      defaultValue: "outlined",
      control: { type: "radio", labels: { filled: "Filled", outlined: "Outlined" } },
    },
    as: {
      options: ["default", "floating", "filter", "inline"],
      defaultValue: "default",
      control: {
        type: "radio",
        labels: { default: "Default", floating: "Floating", filter: "Filter", inline: "Inline" },
      },
    },
  },
  component: FormStory,
};

export default meta;

type Story = StoryObj<typeof FormStory>;

export const Default: Story = {
  args: {
    isClearable: false,
    variant: "outlined",
    as: "default",
  },
};

export const WithDefaultValues: Story = {
  args: {
    defaultValues: {
      input: "Input value",
      numberInput: 3,
      textArea: "TextArea value",
      password: "123",
      selectSingleMode: OptionEnum.Option1,
      selectMultipleMode: [OptionEnum.Option1],
      autocompleteSingleMode: OptionEnum.Option1,
      autocompleteMultipleMode: [OptionEnum.Option1],
      slider: 50,
      rangeSlider: [10, 90],
      checkbox: true,
      toggle: true,
      radioGroup: OptionEnum.Option1,
      date: "2025-03-04",
      dateRange: { start: "2025-03-01", end: "2025-03-15" },
      time: new Date(2025, 2, 4, 16, 0, 0).toISOString(),
      dateTime: new Date(2025, 2, 4).toISOString(),
      textEditor: {
        json: {
          type: "doc",
          content: [
            {
              type: "paragraph",
              attrs: {
                textAlign: null,
              },
              content: [
                {
                  type: "text",
                  text: "Sample text",
                },
              ],
            },
          ],
        },
      },
      segmentSingleMode: OptionEnum.Option1,
      segmentMultipleMode: [OptionEnum.Option1],
      inputUpload: [new File([], "test1.pdf"), new File([], "test2.docx")],
    },
    isClearable: true,
    variant: "outlined",
    as: "default",
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    variant: "outlined",
    as: "default",
  },
};
