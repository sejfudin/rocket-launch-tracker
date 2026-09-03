import { useTranslation } from "react-i18next";

export const DefaultAppHead = () => {
  const { t } = useTranslation();

  const title = t(($) => $.appName);
  const description = t(($) => $.appDescription);

  return (
    <>
      <title>{title}</title>
      <meta
        name="description"
        content={description}
      />
      <meta
        property="og:title"
        content={title}
      />
      <meta
        property="og:description"
        content={description}
      />
      <meta
        name="twitter:title"
        content={title}
      />
      <meta
        name="twitter:description"
        content={description}
      />
    </>
  );
};
