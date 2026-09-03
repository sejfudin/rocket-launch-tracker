import { Button, FileUpload, type FileUploadRequest, Typography } from "@povio/ui";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";

const mockFileUpload = async (
  request: FileUploadRequest,
  file: File,
  options?: {
    abortController?: AbortController;
    onUploadProgress?: (progress: { loaded: number; total: number }) => void;
  },
) => {
  if (options?.onUploadProgress) {
    let progress = 0;
    const interval = setInterval(() => {
      progress += 20;
      options?.onUploadProgress?.({ loaded: progress, total: 100 });
      if (progress >= 100) {
        clearInterval(interval);
      }
    }, 200);
  }

  await new Promise<void>((resolve) => {
    // oxlint-disable-next-line no-console
    console.log("Resolving", request, file, options);
    setTimeout(resolve, 1000);
  });

  return { id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}` };
};

const mockFileRemove = async ({ id }: { id: string }) => {
  await new Promise<void>((resolve) => {
    // oxlint-disable-next-line no-console
    console.log("Resolving", id);
    setTimeout(resolve, 500);
  });
};

// Component that demonstrates real-world FileUpload implementation
const FileUploadDemo = () => {
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [error, setError] = useState<string>("");

  // Simulating MediaQueries hooks
  const simulateUploadRequest = async (request: FileUploadRequest, file: File) => {
    // oxlint-disable-next-line no-console
    console.log("Upload request:", request, file);

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Simulate response
    const response = {
      method: "POST",
      url: "https://example.com/upload",
      fields: [{ key: "file", value: file.name }],
      id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };

    return response;
  };

  const simulateDeleteRequest = async (id: string) => {
    // oxlint-disable-next-line no-console
    console.log("Delete request:", id);

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 500));
  };

  const handleFileUpload = async (request: FileUploadRequest, file: File) => {
    try {
      setError("");
      const response = await simulateUploadRequest(request, file);

      const result = {
        method: response.method || "POST",
        url: response.url || "",
        fields: response.fields || [],
        id: response.id || "",
      };

      setUploadedFiles((prev) => [...prev, result.id]);

      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
      throw err;
    }
  };

  const handleFileRemove = async ({ id }: { id: string }) => {
    try {
      setError("");
      await simulateDeleteRequest(id);
      setUploadedFiles((prev) => prev.filter((fileId) => fileId !== id));
      // oxlint-disable-next-line no-console
      console.log("file removed");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
      throw err;
    }
  };

  const handleClearAll = () => {
    setUploadedFiles([]);
    setError("");
  };

  return (
    <div className="flex flex-col gap-6 p-6 text-text-default-1">
      <Typography
        size="title-3"
        variant="prominent-1"
      >
        FileUpload Implementation Example
      </Typography>

      <Typography size="body-2">
        This demonstrates a real-world implementation of the FileUpload component with API integration using
        MediaQueries hooks.
      </Typography>

      <pre className="rounded-lg bg-elevation-fill-default-2 p-4">
        <Typography
          size="body-2"
          variant="prominent-2"
          className="mb-2"
        >
          Implementation Code:
        </Typography>
        <code className="text-sm">
          {`import { FileUpload, type FileUploadRequest } from "@povio/ui";

const { mutateAsync: uploadFile } = MediaQueries.useUploadRequest();
const { mutateAsync: deleteFile } = MediaQueries.useDeleteRequest();

const handleFileUpload = async (request: FileUploadRequest, file: File) => {
  try {
    const response = await uploadFile({
      data: {
        ...request.data,
        resourceName: "large-image",
        mimeType: file.type,
      },
      file,
    });

    const result = {
      method: response.method || "POST",
      url: response.url || "",
      fields: response.fields || [],
      id: response.id || "",
    };

    return result;
  } catch (err) {
    throw err;
  }
};

const handleFileRemove = async ({ id }: { id: string }) => {
  try {
    await deleteFile({ id });
  } catch (err) {
    throw err;
  }
  console.log("file removed");
};

<FileUpload
  label="Upload File"
  acceptedFileTypes={["image/jpeg", "image/png", "image/webp"]}
  fileUpload={handleFileUpload}
  fileRemove={handleFileRemove}
/>`}
        </code>
      </pre>

      <div className="rounded-lg bg-elevation-fill-default-2 p-4">
        <Typography
          size="body-2"
          variant="prominent-2"
          className="mb-4"
        >
          Interactive Example:
        </Typography>

        <FileUpload
          label="Upload File"
          helperText="Upload images (JPEG, PNG, WEBP)"
          acceptedFileTypes={["image/jpeg", "image/png", "image/webp"]}
          fileUpload={handleFileUpload}
          fileRemove={handleFileRemove}
          error={error}
        />
      </div>

      {uploadedFiles.length > 0 && (
        <div className="rounded-lg bg-elevation-fill-default-2 p-4">
          <div className="mb-2 flex items-center justify-between">
            <Typography
              size="body-2"
              variant="prominent-2"
            >
              Uploaded Files ({uploadedFiles.length}):
            </Typography>
            <Button
              onPress={handleClearAll}
              color="error"
              size="xs"
              width="hug"
            >
              Clear All
            </Button>
          </div>
          <div className="flex flex-col gap-2">
            {uploadedFiles.map((fileId) => (
              <Typography
                key={fileId}
                size="body-3"
                className="font-mono"
              >
                {fileId}
              </Typography>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const meta: Meta<typeof FileUpload> = {
  component: FileUpload,
  argTypes: {
    variant: {
      options: ["vertical", "horizontal"],
      defaultValue: "vertical",
      control: { type: "radio", labels: { vertical: "Vertical", horizontal: "Horizontal" } },
    },
    as: {
      options: ["button", "link"],
      defaultValue: "button",
      control: { type: "radio", labels: { button: "Button", link: "Link" } },
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
      control: { type: "object" },
    },
    error: {
      control: { type: "text" },
    },
  },
  args: {
    fileUpload: mockFileUpload,
    fileRemove: mockFileRemove,
  },
};

export default meta;

type Story = StoryObj<typeof FileUpload>;

export const Default: Story = {
  args: {
    label: "Upload File",
    helperText: "Choose a file to upload",
    tooltipText: "Select files from your device",
    emptyText: "Upload file",
    uploadText: "Drag & drop files here or",
    browseText: "Browse",
    variant: "vertical",
    allowsMultiple: false,
    isRequired: false,
    isDisabled: false,
  },
};

export const CodeImplementationDemo: StoryObj<typeof FileUploadDemo> = {
  render: () => <FileUploadDemo />,
};

export const MultipleFiles: Story = {
  args: {
    label: "Upload Multiple Files",
    helperText: "You can upload multiple files at once",
    tooltipText: "Select multiple files from your device",
    emptyText: "Drag and drop your files here",
    uploadText: "Drag & drop files here or",
    browseText: "Browse",
    variant: "vertical",
    allowsMultiple: true,
    isRequired: false,
    isDisabled: false,
  },
};

export const Horizontal: Story = {
  args: {
    label: "Upload File",
    helperText: "Choose a file to upload",
    tooltipText: "Select files from your device",
    emptyText: "Upload file",
    uploadText: "Drag & drop files here or",
    browseText: "Browse",
    variant: "horizontal",
    allowsMultiple: false,
    isRequired: false,
    isDisabled: false,
  },
};

export const Required: Story = {
  args: {
    label: "Upload Required File",
    helperText: "This field is required",
    tooltipText: "You must upload a file to continue",
    emptyText: "Upload file",
    uploadText: "Drag & drop files here or",
    browseText: "Browse",
    variant: "vertical",
    allowsMultiple: false,
    isRequired: true,
    isDisabled: false,
  },
};

export const Disabled: Story = {
  args: {
    label: "Upload File (Disabled)",
    helperText: "This upload is currently disabled",
    tooltipText: "File upload is not available",
    emptyText: "File upload is disabled",
    uploadText: "Drag & drop files here or",
    browseText: "Browse",
    variant: "vertical",
    allowsMultiple: false,
    isRequired: false,
    isDisabled: true,
  },
};

export const WithError: Story = {
  args: {
    label: "Upload File",
    helperText: "Choose a file to upload",
    tooltipText: "Select files from your device",
    emptyText: "Upload file",
    uploadText: "Drag & drop files here or",
    browseText: "Browse",
    variant: "vertical",
    allowsMultiple: false,
    isRequired: false,
    isDisabled: false,
    error: "Please upload a valid file",
  },
};

export const WithFileTypeRestrictions: Story = {
  args: {
    label: "Upload Image",
    helperText: "Only image files are allowed",
    tooltipText: "Select an image file (JPG, PNG, GIF)",
    emptyText: "Drag and drop your image here",
    uploadText: "Drag & drop files here or",
    browseText: "Browse",
    variant: "vertical",
    allowsMultiple: false,
    isRequired: false,
    isDisabled: false,
    acceptedFileTypes: ["image/jpeg", "image/png", "image/gif"],
    onInvalidFileType: (filename) => {
      // oxlint-disable-next-line no-console
      console.log("Invalid file type received:", filename);
    },
  },
};

export const HiddenLabel: Story = {
  args: {
    label: "Upload File",
    helperText: "Choose a file to upload",
    tooltipText: "Select files from your device",
    emptyText: "Upload file",
    uploadText: "Drag & drop files here or",
    browseText: "Browse",
    variant: "vertical",
    allowsMultiple: false,
    isRequired: false,
    isDisabled: false,
    hideLabel: true,
  },
};

export const CustomText: Story = {
  args: {
    label: "Upload Document",
    helperText: "Upload your important document",
    tooltipText: "Select a document from your computer",
    emptyText: "Drop your document here for quick upload",
    uploadText: "alternatively",
    browseText: "Browse",
    variant: "vertical",
    allowsMultiple: false,
    isRequired: false,
    isDisabled: false,
  },
};
