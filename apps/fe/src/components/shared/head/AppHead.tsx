import { useTranslation } from "react-i18next";

interface IProps {
  title?: string;
  description?: string;
  omitSuffix?: boolean;
}

export const AppHead = ({ title: titleProp, description: descriptionProp, omitSuffix }: IProps) => {
  const { t } = useTranslation();

  const titleParts: string[] = [];
  if (titleProp) {
    titleParts.push(titleProp);
  }
  if (!omitSuffix) {
    titleParts.push(t(($) => $.appName));
  }

  const title = titleParts.join(" | ");
  const description = descriptionProp ?? t(($) => $.appDescription);

  return (
    <>
      <title>{title}</title>
      <meta
        name="description"
        content={description}
      />
    </>
  );
};
