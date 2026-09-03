import { InputUpload } from "@povio/ui";
import type { Meta, StoryObj } from "@storybook/react-vite";

const meta: Meta<typeof InputUpload> = {
  component: InputUpload,
  argTypes: {
    variant: {
      options: ["default", "nested"],
      defaultValue: "default",
      control: { type: "radio", labels: { default: "Default", nested: "Nested" } },
    },
    allowsMultiple: {
      control: { type: "boolean" },
      defaultValue: false,
    },
    isDisabled: {
      control: { type: "boolean" },
      defaultValue: false,
    },
    isRequired: {
      control: { type: "boolean" },
      defaultValue: false,
    },
    hideLabel: {
      control: { type: "boolean" },
      defaultValue: false,
    },
    acceptedFileTypes: {
      control: { type: "text" },
    },
    error: {
      control: { type: "text" },
    },
  },
  args: {
    onChange: () => {
      // oxlint-disable-next-line no-console
      console.log("onChange");
    },
  },
};

export default meta;

type Story = StoryObj<typeof InputUpload>;

export const Default: Story = {
  args: {
    label: "Upload File",
    helperText: "Choose a file to upload",
    tooltipText: "Select a file from your device",
    variant: "default",
    allowsMultiple: false,
    isRequired: false,
    isDisabled: false,
    hideLabel: false,
  },
};

export const Nested: Story = {
  args: {
    label: "Upload File (Nested)",
    helperText: "Nested variant with inline upload button",
    tooltipText: "Select a file from your device",
    variant: "nested",
    allowsMultiple: false,
    isRequired: false,
    isDisabled: false,
    hideLabel: false,
    acceptedFileTypes: [".pdf", ".doc", ".docx", ".txt"],
    onInvalidFileType: (filename) => {
      // oxlint-disable-next-line no-console
      console.log("Invalid file type received:", filename);
    },
  },
};

export const MultipleFiles: Story = {
  args: {
    label: "Upload Multiple Files",
    helperText: "You can select multiple files at once",
    tooltipText: "Select multiple files from your device",
    variant: "default",
    allowsMultiple: true,
    isRequired: false,
    isDisabled: false,
    hideLabel: false,
    acceptedFileTypes: [".pdf", ".doc", ".docx", ".txt"],
    onInvalidFileType: (filenames) => {
      // oxlint-disable-next-line no-console
      console.log("Invalid file type received:", filenames);
    },
  },
};

export const MultipleFilesNested: Story = {
  args: {
    label: "Upload Multiple Files (Nested)",
    helperText: "Multiple file upload with nested variant",
    tooltipText: "Select multiple files from your device",
    variant: "nested",
    allowsMultiple: true,
    isRequired: false,
    isDisabled: false,
    hideLabel: false,
  },
};

export const CustomText: Story = {
  args: {
    label: "Upload File",
    helperText: "Choose a file to upload",
    tooltipText: "Select a file from your device",
    variant: "default",
    allowsMultiple: false,
    isRequired: false,
    isDisabled: false,
    hideLabel: false,
    placeholder: "Upload your profile photo",
    buttonText: "Upload photo",
    acceptedFileTypes: ["image/*"],
  },
};
