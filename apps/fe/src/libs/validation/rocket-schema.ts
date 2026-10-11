import type { TFunction } from "i18next";
import { DateTime } from "luxon";
import z from "zod";

import { defaultNS } from "@/config/i18n";
import { RocketModels } from "@/openapi/rocket/rocket.models";

export namespace RocketSchema {
  export const CREW_SIZE = 3;

  export interface CreateFormValues {
    name: string;
    launchDatetime: string;
    weight: number;
    height: number;
    rocketType: RocketModels.RocketType;
    passengers: { name: string }[];
    crew: string[];
  }

  export const toCreateRequest = (values: CreateFormValues): RocketModels.RocketCreateRequest => {
    const data: RocketModels.RocketCreateRequest = {
      name: values.name.trim(),
      launchDatetime: values.launchDatetime,
      weight: values.weight,
      height: values.height,
      rocketType: values.rocketType,
    };

    if (values.rocketType === RocketModels.RocketType.commercial) {
      data.passengers = values.passengers.map((passenger) => passenger.name.trim()).filter(Boolean);
      return data;
    }

    data.crew = values.crew.map((member) => member.trim());
    return data;
  };

  const baseFields = (t: TFunction) => ({
    name: z
      .string(
        t(($) => $.rockets.form.nameRequired, {
          defaultNS,
        }),
      )
      .trim()
      .min(
        1,
        t(($) => $.rockets.form.nameRequired, {
          defaultNS,
        }),
      ),
    launchDatetime: z
      .string(
        t(($) => $.rockets.form.launchDateRequired, {
          defaultNS,
        }),
      )
      .refine(
        (value) => {
          const launch = DateTime.fromISO(value);
          return launch.isValid && launch > DateTime.now();
        },
        t(($) => $.rockets.errors.invalidLaunchDatetime, { defaultNS }),
      ),
    weight: z
      .number(
        t(($) => $.rockets.form.weightRequired, {
          defaultNS,
        }),
      )
      .gt(
        0,
        t(($) => $.rockets.errors.invalidWeight, {
          defaultNS,
        }),
      ),
    height: z
      .number(
        t(($) => $.rockets.form.heightRequired, {
          defaultNS,
        }),
      )
      .gt(
        0,
        t(($) => $.rockets.errors.invalidHeight, {
          defaultNS,
        }),
      ),
  });

  const passengersField = (t: TFunction) =>
    z.array(z.object({ name: z.string() })).superRefine((passengers, ctx) => {
      if (passengers.some((passenger) => passenger.name.trim())) {
        return;
      }

      ctx.addIssue({
        code: "custom",
        message: t(($) => $.rockets.form.passengerRequired, { defaultNS }),
        path: [0, "name"],
      });
    });

  const crewField = (t: TFunction) =>
    z
      .array(z.string())
      .length(CREW_SIZE)
      .superRefine((crew, ctx) => {
        crew.forEach((member, index) => {
          if (member.trim()) {
            return;
          }

          ctx.addIssue({
            code: "custom",
            message: t(($) => $.rockets.form.crewRequired, { defaultNS }),
            path: [index],
          });
        });
      });

  export const CreateFormSchema = (t: TFunction) =>
    z.discriminatedUnion("rocketType", [
      z.object({
        ...baseFields(t),
        rocketType: z.literal(RocketModels.RocketType.commercial),
        passengers: passengersField(t),
        crew: z.array(z.string()),
      }),
      z.object({
        ...baseFields(t),
        rocketType: z.literal(RocketModels.RocketType.space_exploration),
        passengers: z.array(z.object({ name: z.string() })),
        crew: crewField(t),
      }),
    ]);
}
