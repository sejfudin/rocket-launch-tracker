import { Button, CheckIcon, FileUploadContainer, type FileUploadRequest, Typography } from "@povio/ui";
import type { Meta, StoryObj } from "@storybook/react-vite";

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

const meta: Meta<typeof FileUploadContainer> = {
  component: FileUploadContainer,
  argTypes: {
    allowsMultiple: {
      control: { type: "boolean" },
      defaultValue: false,
    },
    isDisabled: {
      control: { type: "boolean" },
      defaultValue: false,
    },
    acceptedFileTypes: {
      control: { type: "text" },
    },
  },
  args: {
    fileUpload: mockFileUpload,
    fileRemove: mockFileRemove,
  },
};

export default meta;

type Story = StoryObj<typeof FileUploadContainer>;

export const Default: Story = {
  args: {
    allowsMultiple: false,
    isDisabled: false,
    children: ({ files, onRemove, onCancel }) => (
      <div className="flex flex-col gap-2">
        <div className="flex h-screen w-screen items-center justify-center bg-elevation-fill-default-3">
          <Typography
            variant="default"
            size="title-4"
            as="h4"
          >
            Your container
          </Typography>
        </div>
        {files.length > 0 && (
          <div className="mt-4 space-y-2">
            <Typography
              variant="default"
              size="body-1"
              className="font-medium"
            >
              Uploaded Files:
            </Typography>
            {files.map((file, index) => (
              <div
                key={file.file.name}
                className="flex items-center justify-between rounded border bg-gray-100 p-3"
              >
                <div className="flex items-center gap-2">
                  <CheckIcon className="h-4 w-4 text-green-500" />
                  <Typography
                    variant="default"
                    size="body-2"
                  >
                    {file.file.name}
                  </Typography>
                </div>
                <div className="flex items-center gap-2">
                  {file.state === "uploading" && (
                    <>
                      <Typography
                        variant="prominent-1"
                        size="body-3"
                      >
                        {file.progress}%
                      </Typography>
                      <Button
                        variant="subtle"
                        size="xs"
                        onPress={() => onCancel(index)}
                        className="text-red-500"
                      >
                        Cancel
                      </Button>
                    </>
                  )}
                  {file.state === "uploaded" && file.id && (
                    <Button
                      variant="subtle"
                      size="xs"
                      onPress={() => onRemove(file.id!)}
                      className="text-red-500"
                    >
                      Remove
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    ),
  },
};

export const MultipleFiles: Story = {
  args: {
    allowsMultiple: true,
    isDisabled: false,
    children: ({ files, onRemove, onCancel }) => (
      <div className="flex min-h-[200px] flex-col justify-center rounded-lg border-2 border-gray-300 border-dashed p-8 text-center">
        <div className="space-y-2">
          <Typography
            variant="default"
            size="title-4"
            as="h4"
          >
            Drop multiple files here or click to browse
          </Typography>
          <Typography
            variant="prominent-1"
            size="body-2"
          >
            Multiple file upload container
          </Typography>
          {files.length > 0 && (
            <div className="mt-4 space-y-2">
              <Typography
                variant="default"
                size="body-1"
                className="font-medium"
              >
                Uploaded Files ({files.length}):
              </Typography>
              <div className="grid gap-2">
                {files.map((file, index) => (
                  <div
                    key={file.file.name}
                    className="flex items-center justify-between rounded border bg-gray-100 p-3"
                  >
                    <div className="flex items-center gap-2">
                      <CheckIcon className="h-4 w-4 text-green-500" />
                      <Typography
                        variant="default"
                        size="body-2"
                      >
                        {file.file.name}
                      </Typography>
                      <Typography
                        variant="prominent-1"
                        size="body-3"
                      >
                        ({(file.file.size / 1024).toFixed(1)} KB)
                      </Typography>
                    </div>
                    <div className="flex items-center gap-2">
                      {file.state === "uploading" && (
                        <>
                          <Typography
                            variant="prominent-1"
                            size="body-3"
                          >
                            {file.progress}%
                          </Typography>
                          <Button
                            variant="subtle"
                            size="xs"
                            onPress={() => onCancel(index)}
                            className="text-red-500"
                          >
                            Cancel
                          </Button>
                        </>
                      )}
                      {file.state === "uploaded" && file.id && (
                        <Button
                          variant="subtle"
                          size="xs"
                          onPress={() => onRemove(file.id!)}
                          className="text-red-500"
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    ),
  },
};
