import { useTranslation } from "react-i18next";

import { NotFound } from "@/components/shared/error/NotFound";
import { AppHead } from "@/components/shared/head/AppHead";

export const NotFoundPage = () => {
  const { t } = useTranslation();

  return (
    <>
      <AppHead
        title={t(($) => $.shared.notFound.head.title)}
        description={t(($) => $.shared.notFound.head.description)}
      />
      <NotFound />
    </>
  );
};
