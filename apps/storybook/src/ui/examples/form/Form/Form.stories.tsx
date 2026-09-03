import { Button, Form, useForm } from "@povio/ui";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { z } from "zod";

const SimpleFormSchema = z.object({
  name: z.string(),
  email: z.email(),
  age: z.number(),
  bio: z.string(),
  role: z.array(z.enum(["user", "admin", "editor"])),
  notifications: z.boolean(),
});

const AdvancedFormSchema = z.object({
  username: z.string(),
  password: z.string(),
  description: z.string(),
  skills: z.array(z.string()),
  startDate: z.iso.datetime(),
  theme: z.enum(["light", "dark", "system"]),
  emailFrequency: z.enum(["daily", "weekly", "monthly"]),
});

const roleOptions = [
  { id: "user", label: "User" },
  { id: "admin", label: "Administrator" },
  { id: "editor", label: "Editor" },
];

const skillOptions = [
  { id: "react", label: "React" },
  { id: "typescript", label: "TypeScript" },
  { id: "node", label: "Node.js" },
  { id: "python", label: "Python" },
];

const themeOptions = [
  { id: "light", label: "Light" },
  { id: "dark", label: "Dark" },
  { id: "system", label: "System" },
];

const emailFrequencyOptions = [
  { id: "daily", label: "Daily" },
  { id: "weekly", label: "Weekly" },
  { id: "monthly", label: "Monthly" },
];

const meta: Meta<typeof Form> = {
  component: Form,
};

export default meta;

type Story = StoryObj<typeof Form>;

export const DetectedInputTypes: Story = {
  render: () => {
    const form = useForm({
      zodSchema: SimpleFormSchema,
      defaultValues: {
        notifications: false,
      },
    });

    return (
      <Form
        form={form}
        schema={SimpleFormSchema}
        // oxlint-disable-next-line no-console
        onSubmit={console.log}
        className="mx-auto max-w-xl"
      >
        {({ Name, Email, Age, Bio, Role, Notifications }) => (
          <div className="space-y-4">
            <Name
              label="Full Name"
              placeholder="John Doe"
            />
            <Email
              label="Email Address"
              placeholder="john@example.com"
            />
            <Age
              label="Age"
              placeholder="Enter your age"
            />
            <Bio
              label="Biography"
              placeholder="Tell us about yourself"
            />
            <Role
              label="Role"
              placeholder="Select a role"
              items={roleOptions}
            />
            <Notifications label="Enable Notifications" />

            <Button
              type="submit"
              className="mt-4"
            >
              Submit
            </Button>
          </div>
        )}
      </Form>
    );
  },
};

export const ExplicitInputTypes: Story = {
  render: () => {
    const form = useForm({
      zodSchema: AdvancedFormSchema,
    });

    return (
      <Form
        form={form}
        schema={AdvancedFormSchema}
        // oxlint-disable-next-line no-console
        onSubmit={console.log}
        className="mx-auto max-w-xl"
      >
        {({ Username, Password, Description, Skills, StartDate, Theme, EmailFrequency }) => (
          <div className="space-y-4">
            <Username
              label="Username"
              placeholder="Choose a username"
            />
            <Password
              inputType="passwordInput"
              label="Password"
              placeholder="Enter your password"
            />
            <Description
              inputType="textArea"
              label="Description"
              placeholder="Tell us about yourself"
            />
            <Skills
              inputType="select"
              label="Skills"
              placeholder="Select your skills"
              items={skillOptions}
              selectionMode="multiple"
            />
            <StartDate
              inputType="dateTimePicker"
              label="Start Date"
              placeholder="When can you start?"
            />
            <Theme
              inputType="segment"
              label="Theme"
              items={themeOptions}
            />
            <EmailFrequency
              inputType="select"
              label="Email Frequency"
              items={emailFrequencyOptions}
            />

            <div className="flex items-center gap-4 pt-4">
              <Button
                type="button"
                variant="outlined"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
              >
                Create Account
              </Button>
            </div>
          </div>
        )}
      </Form>
    );
  },
};

export const CustomLayout: Story = {
  render: () => {
    const form = useForm({
      zodSchema: SimpleFormSchema,
      defaultValues: {
        notifications: false,
      },
    });

    return (
      <Form
        form={form}
        schema={SimpleFormSchema}
        // oxlint-disable-next-line no-console
        onSubmit={console.log}
        className="mx-auto max-w-xl"
      >
        {({ Name, Email, Age, Bio, Role, Notifications }) => (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <Name
                label="Full Name"
                placeholder="John Doe"
              />
              <Email
                label="Email Address"
                placeholder="john@example.com"
              />
            </div>

            <div className="flex gap-4">
              <div className="w-1/4">
                <Age
                  label="Age"
                  placeholder="Enter your age"
                />
              </div>
              <div className="flex-1">
                <Role
                  label="Role"
                  placeholder="Select a role"
                  items={roleOptions}
                />
              </div>
            </div>

            <Bio
              inputType="textArea"
              label="Biography"
              placeholder="Tell us about yourself"
              rows={4}
            />

            <div className="flex items-center justify-end">
              <Notifications label="Enable Notifications" />
            </div>

            <Button
              type="submit"
              className="mt-4"
            >
              Save Changes
            </Button>
          </div>
        )}
      </Form>
    );
  },
};
