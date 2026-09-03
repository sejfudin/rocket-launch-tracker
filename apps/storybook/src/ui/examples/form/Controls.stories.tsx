import {
  Autocomplete,
  Button,
  Checkbox,
  DatePicker,
  DateRangePicker,
  DateTimePicker,
  InputUpload,
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
} from "@povio/ui";
import { TextEditor, type TextEditorValue } from "@povio/ui/text-editor";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { type FormEvent, useState } from "react";

enum OptionEnum {
  Option1 = "option-1",
  Option2 = "option-2",
  Option3 = "option-3",
}

interface FormType {
  input: string;
  numberInput: number;
  textArea: string;
  password: string;
  selectSingleMode: OptionEnum;
  selectMultipleMode: OptionEnum[];
  autocompleteSingleMode: OptionEnum;
  autocompleteMultipleMode: OptionEnum[];
  slider: number;
  rangeSlider: number[];
  checkbox: boolean;
  toggle: boolean;
  radioGroup: OptionEnum;
  date: string;
  dateRange: { start: string | null; end: string | null };
  dateTime: string;
  time: string;
  textEditor: TextEditorValue;
  segmentSingleMode: OptionEnum;
  segmentMultipleMode: OptionEnum[];
  inputUpload: File[];
}

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
  defaultValues?: FormType;
  disabled?: boolean;
  isClearable?: boolean;
}

const FormStory = ({ defaultValues, disabled, isClearable }: Props) => {
  const [input, setInput] = useState(defaultValues?.input);
  const [numberInput, setNumberInput] = useState<number | null>(defaultValues?.numberInput ?? null);
  const [textArea, setTextArea] = useState(defaultValues?.textArea);
  const [password, setPassword] = useState(defaultValues?.password);
  const [selectSingleMode, setSelectSingleMode] = useState<OptionEnum | null | undefined>(
    defaultValues?.selectSingleMode,
  );
  const [selectMultipleMode, setSelectMultipleMode] = useState(defaultValues?.selectMultipleMode);
  const [autocompleteSingleMode, setAutocompleteSingleMode] = useState<OptionEnum | null>(
    defaultValues?.autocompleteSingleMode ?? null,
  );
  const [autocompleteMultipleMode, setAutocompleteMultipleMode] = useState<OptionEnum[]>(
    defaultValues?.autocompleteMultipleMode ?? [],
  );
  const [slider, setSlider] = useState(defaultValues?.slider);
  const [rangeSlider, setRangeSlider] = useState(defaultValues?.rangeSlider);
  const [checkbox, setCheckbox] = useState(defaultValues?.checkbox);
  const [toggle, setToggle] = useState(defaultValues?.toggle);
  const [radioGroup, setRadioGroup] = useState(defaultValues?.radioGroup);
  const [date, setDate] = useState<string | null>(defaultValues?.date ?? null);
  const [dateRange, setDateRange] = useState<{ start: string | null; end: string | null } | null>(
    defaultValues?.dateRange ?? null,
  );
  const [time, setTime] = useState<string | null>(defaultValues?.time ?? null);
  const [dateTime, setDateTime] = useState<string | null>(defaultValues?.dateTime ?? null);
  const [textEditor, setTextEditor] = useState<TextEditorValue | null>(defaultValues?.textEditor ?? null);
  const [segmentSingleMode, setSegmentSingleMode] = useState(defaultValues?.segmentSingleMode ?? null);
  const [segmentMultipleMode, setSegmentMultipleMode] = useState(defaultValues?.segmentMultipleMode ?? []);
  const [inputUpload, setInputUpload] = useState<File[]>(defaultValues?.inputUpload ?? []);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // oxlint-disable-next-line no-console
    console.log("onSubmit", {
      input,
      numberInput,
      textArea,
      selectSingleMode,
      selectMultipleMode,
      autocompleteSingleMode,
      autocompleteMultipleMode,
      slider,
      rangeSlider,
      checkbox,
      toggle,
      radioGroup,
      date,
      dateRange,
      time,
      dateTime,
      textEditor,
      inputUpload,
    });
  };

  return (
    <form
      onSubmit={onSubmit}
      className="flex flex-col gap-4"
    >
      <TextInput
        value={input}
        onChange={setInput}
        label="Input label"
        placeholder="Input placeholder"
        isDisabled={disabled}
        isClearable={isClearable}
      />

      <NumberInput
        value={numberInput}
        onChange={setNumberInput}
        label="Number input label"
        placeholder="Number input placeholder"
        isDisabled={disabled}
        isClearable={isClearable}
      />

      <TextArea
        value={textArea}
        onChange={setTextArea}
        label="TextArea label"
        placeholder="TextArea placeholder"
        isDisabled={disabled}
        isClearable={isClearable}
      />

      <PasswordInput
        value={password}
        onChange={setPassword}
        label="Password label"
        placeholder="Password placeholder"
        isDisabled={disabled}
        isClearable={isClearable}
      />

      <Select
        value={selectSingleMode}
        onChange={setSelectSingleMode}
        label="Select single mode label"
        placeholder="Select option..."
        items={options}
        isDisabled={disabled}
        isClearable={isClearable}
      />

      <Select
        value={selectMultipleMode}
        onChange={setSelectMultipleMode}
        selectionMode="multiple"
        label="Select multiple mode label"
        placeholder="Select option..."
        items={options}
        isDisabled={disabled}
        isClearable={isClearable}
      />

      <Autocomplete
        value={autocompleteSingleMode}
        onChange={setAutocompleteSingleMode}
        label="Autocomplete single mode label"
        placeholder="Select option..."
        items={options}
        isDisabled={disabled}
        isClearable={isClearable}
      />

      <Autocomplete
        value={autocompleteMultipleMode}
        onChange={setAutocompleteMultipleMode}
        selectionMode="multiple"
        label="Autocomplete multiple mode label"
        placeholder="Select option..."
        items={options}
        isDisabled={disabled}
        isClearable={isClearable}
      />

      <Slider
        value={slider}
        onChange={setSlider}
        label="Percentage"
        unit="%"
        isDisabled={disabled}
      />

      <Slider
        isRange
        value={rangeSlider}
        onChange={setRangeSlider}
        label="Percentage"
        unit="%"
        isDisabled={disabled}
      />

      <Checkbox
        isSelected={checkbox}
        onChange={setCheckbox}
        isDisabled={disabled}
      >
        Checkbox text
      </Checkbox>

      <Toggle
        isSelected={toggle}
        onChange={setToggle}
        isDisabled={disabled}
      >
        Toggle text
      </Toggle>

      <RadioGroup
        value={radioGroup}
        onChange={(val) => setRadioGroup(val as OptionEnum)}
        label="RadioGroup label"
        options={[
          { value: OptionEnum.Option1, label: "Option 1" },
          { value: OptionEnum.Option2, label: "Option 2" },
        ]}
        isDisabled={disabled}
      />

      <DatePicker
        value={date}
        onChange={setDate}
        label="DatePicker label"
        isDisabled={disabled}
        isClearable={isClearable}
      />

      <DateRangePicker
        value={dateRange}
        onChange={setDateRange}
        label="DateRangePicker label"
        isDisabled={disabled}
        isClearable={isClearable}
      />

      <TimePicker
        value={time}
        onChange={setTime}
        label="TimePicker label"
        isDisabled={disabled}
        isClearable={isClearable}
      />

      <DateTimePicker
        value={dateTime}
        onChange={setDateTime}
        label="DateTimePicker label"
        isDisabled={disabled}
        isClearable={isClearable}
      />

      <TextEditor
        label="TextEditor label"
        value={textEditor}
        onChange={setTextEditor}
        isDisabled={disabled}
      />

      <Segment
        selectionMode="single"
        items={segmentDualOptions}
        isDisabled={disabled}
        value={segmentSingleMode}
        onChange={setSegmentSingleMode}
      />

      <Segment
        selectionMode="multiple"
        items={segmentOptions}
        isDisabled={disabled}
        value={segmentMultipleMode}
        onChange={setSegmentMultipleMode}
      />

      <InputUpload
        allowsMultiple
        label="InputUpload label"
        isDisabled={disabled}
        value={inputUpload}
        onChange={setInputUpload}
      />

      <div className="flex gap-4">
        <Button type="submit">Submit</Button>
      </div>
    </form>
  );
};

const meta: Meta<typeof FormStory> = {
  component: FormStory,
};

export default meta;

type Story = StoryObj<typeof FormStory>;

export const Default: Story = {
  args: {
    isClearable: false,
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
      dateTime: new Date(2025, 2, 4).toISOString(),
      time: new Date(2025, 2, 4, 16, 0, 0).toISOString(),
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
      inputUpload: [new File([], "test.pdf")],
    },
    isClearable: true,
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};
