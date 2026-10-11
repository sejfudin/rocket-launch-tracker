import type { TFunction } from "i18next";
import { DateTime } from "luxon";
import z from "zod";

import { defaultNS } from "@/config/i18n";
import { RocketModels } from "@/openapi/rocket/rocket.models";

const CREW_SIZE = 3;

export namespace RocketSchema {
  export const CreateFormSchema = (t: TFunction) =>
    z
      .object({
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
        rocketType: RocketModels.RocketTypeSchema,
        passengers: z.array(z.object({ name: z.string() })),
        crew: z.array(z.string()).length(CREW_SIZE),
      })
      .superRefine((value, ctx) => {
        if (value.rocketType === RocketModels.RocketType.commercial) {
          const hasPassenger = value.passengers.some((passenger) => passenger.name.trim());
          if (!hasPassenger) {
            ctx.addIssue({
              code: "custom",
              message: t(($) => $.rockets.form.passengerRequired, { defaultNS }),
              path: ["passengers", 0],
            });
          }
          return;
        }

        value.crew.forEach((member, index) => {
          if (!member.trim()) {
            ctx.addIssue({
              code: "custom",
              message: t(($) => $.rockets.form.crewRequired, { defaultNS }),
              path: ["crew", index],
            });
          }
        });
      });
}
