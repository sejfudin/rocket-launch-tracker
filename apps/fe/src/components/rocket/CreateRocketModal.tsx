import { getLocalTimeZone, now } from "@internationalized/date";
import {
  Button,
  DateTimePicker,
  Modal,
  NumberInput,
  Select,
  TextButton,
  TextInput,
  Typography,
  useForm,
  useToast,
} from "@povio/ui";
import { DateTime } from "luxon";
import { I18nProvider } from "react-aria";
import type { SubmitHandler } from "react-hook-form";
import { useFieldArray } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { PlusIcon } from "@/assets/icons/general/Plus";
import { TrashIcon } from "@/assets/icons/general/Trash";
import { useCreateRocket } from "@/hooks/useRockets";
import { RocketSchema } from "@/libs/validation/rocket-schema";
import { RocketModels } from "@/openapi/rocket/rocket.models";
import { RocketErrorUtils } from "@/utils/rocket-error.utils";

interface CreateRocketModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface RocketCreateFormValues {
  name: string;
  launchDatetime: string;
  weight: number;
  height: number;
  rocketType: RocketModels.RocketType;
  passengers: { name: string }[];
  crew: string[];
}

export const CreateRocketModal = ({ isOpen, onClose }: CreateRocketModalProps) => {
  const { t } = useTranslation();
  const { successToast, errorToast } = useToast();
  const createRocket = useCreateRocket();
  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isValid },
  } = useForm<RocketCreateFormValues>({
    zodSchema: RocketSchema.CreateFormSchema(t),
    defaultValues: {
      name: "",
      launchDatetime: null,
      weight: null,
      height: null,
      rocketType: RocketModels.RocketType.commercial,
      passengers: [{ name: "" }],
      crew: ["", "", ""],
    },
  });
  const {
    fields: passengerFields,
    append: appendPassenger,
    remove: removePassenger,
  } = useFieldArray({
    control,
    name: "passengers",
  });
  const rocketType = watch("rocketType");

  const handleClose = () => {
    reset();
    onClose();
  };

  const onSubmit: SubmitHandler<RocketCreateFormValues> = (values) => {
    const launchDatetime = DateTime.fromISO(values.launchDatetime).toISO();
    if (!launchDatetime) {
      return;
    }

    const data: RocketModels.RocketCreateRequest = {
      name: values.name.trim(),
      launchDatetime,
      weight: values.weight,
      height: values.height,
      rocketType: values.rocketType,
    };

    if (values.rocketType === RocketModels.RocketType.commercial) {
      data.passengers = values.passengers.map((passenger) => passenger.name.trim()).filter(Boolean);
    } else {
      data.crew = values.crew.map((member) => member.trim());
    }

    createRocket.mutate(
      { data },
      {
        onSuccess: () => {
          successToast({ text: t(($) => $.rockets.form.createSuccess) });
          handleClose();
        },
        onError: (error) => {
          errorToast({ text: RocketErrorUtils.getErrorMessage(error, t) });
        },
      },
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      modalClassName="rounded-4xl! p-6!"
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex w-[626px] flex-col gap-8"
      >
        <Typography
          size="title-3"
          variant="prominent-1"
          as="h2"
          className="text-text-default-1"
        >
          {t(($) => $.rockets.addNewRocket)}
        </Typography>

        <div className="flex flex-col gap-4">
          <Typography
            size="title-5"
            variant="prominent-1"
            as="h3"
            className="text-text-default-1"
          >
            {t(($) => $.rockets.form.basicInfo)}
          </Typography>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <TextInput
              label={t(($) => $.rockets.form.rocketName)}
              placeholder={t(($) => $.rockets.form.rocketNamePlaceholder)}
              error={errors.name?.message}
              isRequired
              formControl={{ control, name: "name" }}
            />

            <I18nProvider locale="en-GB">
              <DateTimePicker
                label={t(($) => $.rockets.form.launchDate)}
                placeholder={t(($) => $.rockets.form.launchDatePlaceholder)}
                error={errors.launchDatetime?.message}
                isRequired
                fullIso
                minValue={now(getLocalTimeZone())}
                formControl={{ control, name: "launchDatetime" }}
              />
            </I18nProvider>

            <NumberInput
              label={t(($) => $.rockets.form.weight)}
              placeholder={t(($) => $.rockets.form.weightPlaceholder)}
              unit={t(($) => $.rockets.form.weightUnit)}
              error={errors.weight?.message}
              isRequired
              minValue={0}
              formControl={{ control, name: "weight" }}
            />

            <NumberInput
              label={t(($) => $.rockets.form.height)}
              placeholder={t(($) => $.rockets.form.heightPlaceholder)}
              unit={t(($) => $.rockets.form.heightUnit)}
              error={errors.height?.message}
              isRequired
              minValue={0}
              formControl={{ control, name: "height" }}
            />
          </div>
        </div>

        <div className="h-px bg-elevation-outline-default-1" />

        <div className="flex flex-col gap-4">
          <Select
            label={t(($) => $.rockets.form.rocketType)}
            error={errors.rocketType?.message}
            isRequired
            items={[
              { id: RocketModels.RocketType.commercial, label: t(($) => $.rockets.form.commercial) },
              { id: RocketModels.RocketType.space_exploration, label: t(($) => $.rockets.form.spaceExploration) },
            ]}
            formControl={{ control, name: "rocketType" }}
          />

          <div className="flex flex-col gap-4 rounded-xl bg-elevation-fill-default-2 p-4">
            {rocketType === RocketModels.RocketType.commercial ? (
              <>
                <Typography
                  size="title-5"
                  variant="prominent-1"
                  as="h3"
                  className="text-text-default-1"
                >
                  {t(($) => $.rockets.form.passengers)}
                </Typography>
                {passengerFields.map((field, index) => (
                  <TextInput
                    key={field.id}
                    label={t(($) => $.rockets.form.passengerName, { index: index + 1 })}
                    placeholder={t(($) => $.rockets.form.passengerPlaceholder)}
                    error={errors.passengers?.[index]?.name?.message}
                    isRequired={index === 0}
                    action={
                      index > 0
                        ? {
                            icon: TrashIcon,
                            onClick: () => removePassenger(index),
                            altText: t(($) => $.rockets.form.removePassenger),
                          }
                        : undefined
                    }
                    formControl={{ control, name: `passengers.${index}.name` }}
                  />
                ))}
                <TextButton
                  type="button"
                  icon={PlusIcon}
                  className="self-end"
                  onPress={() => appendPassenger({ name: "" })}
                >
                  {t(($) => $.rockets.form.addPassenger)}
                </TextButton>
              </>
            ) : (
              <>
                <Typography
                  size="title-5"
                  variant="prominent-1"
                  as="h3"
                  className="text-text-default-1"
                >
                  {t(($) => $.rockets.form.crew)}
                </Typography>
                {["crew-1", "crew-2", "crew-3"].map((crewKey, index) => (
                  <TextInput
                    key={crewKey}
                    label={t(($) => $.rockets.form.crewMember, { index: index + 1 })}
                    placeholder={t(($) => $.rockets.form.crewPlaceholder)}
                    error={errors.crew?.[index]?.message}
                    isRequired
                    formControl={{ control, name: `crew.${index}` }}
                  />
                ))}
              </>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="h-px bg-elevation-outline-default-1" />
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outlined"
              color="secondary"
              width="hug"
              onPress={handleClose}
            >
              {t(($) => $.rockets.form.cancel)}
            </Button>
            <Button
              type="submit"
              width="hug"
              isDisabled={!isValid}
              isLoading={createRocket.isPending}
            >
              {t(($) => $.rockets.addNewRocket)}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
