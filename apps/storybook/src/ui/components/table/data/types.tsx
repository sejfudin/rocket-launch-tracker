import { z } from "zod";

export const StatusSchema = z.enum(["suspended", "pending", "inactive", "active"]);
export type Status = z.infer<typeof StatusSchema>;
export const Status = StatusSchema.enum;

export const CustomResponseDTOSChema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  address: z.string().nullish(),
  email: z.string(),
  officeAddress: z.string().nullish(),
  organization: z.string().nullish(),
  tag: z.string(),
  status: z.string(),
});

export type CustomResponseDTO = z.infer<typeof CustomResponseDTOSChema>;
