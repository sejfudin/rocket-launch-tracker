import { TextInput } from "@povio/ui";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { SearchIcon } from "@/assets/icons/general/Search";
import { useDebounce } from "@/hooks/useDebounce";

interface RocketSearchProps {
  onSearch: (value: string) => void;
}

export const RocketSearch = ({ onSearch }: RocketSearchProps) => {
  const { t } = useTranslation();
  const [value, setValue] = useState("");
  const debouncedValue = useDebounce(value, 500);

  useEffect(() => {
    onSearch(debouncedValue.trim());
  }, [debouncedValue, onSearch]);

  return (
    <TextInput
      variant="outlined"
      as="inline"
      label={t(($) => $.home.content.search)}
      placeholder={t(($) => $.home.content.search)}
      hideLabel
      value={value}
      onChange={setValue}
      trailingIcon={SearchIcon}
      className="border! w-full max-w-md rounded-s border-input-outlined-outline-idle! bg-elevation-fill-default-1"
    />
  );
};
