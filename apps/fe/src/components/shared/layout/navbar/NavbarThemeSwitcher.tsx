import { IconButton, Select, ThemeContext } from "@povio/ui";
import { useTranslation } from "react-i18next";

import { DarkModeIcon } from "@/assets/icons/navbar/DarkMode";
import { LightModeIcon } from "@/assets/icons/navbar/LightMode";

export const NavbarThemeSwitcher = () => {
  const { t } = useTranslation();
  const { theme, systemTheme, updateTheme } = ThemeContext.useTheme();

  const getContent = (themeValue: ThemeContext.Theme) => {
    let Icon = LightModeIcon;
    if (themeValue === "dark" || (themeValue === "system" && systemTheme === "dark")) {
      Icon = DarkModeIcon;
    }

    let label = t(($) => $.navbar.themeSwitcher.light);
    if (themeValue === "dark") {
      label = t(($) => $.navbar.themeSwitcher.dark);
    } else if (themeValue === "system" && systemTheme === "light") {
      label = t(($) => $.navbar.themeSwitcher.autoLight);
    } else if (themeValue === "system" && systemTheme === "dark") {
      label = t(($) => $.navbar.themeSwitcher.autoDark);
    }

    return (
      <span className="flex items-center gap-list-gap-checkbox-to-label">
        <Icon className="size-6 text-interactive-contained-primary-idle group-selected:text-interactive-contained-primary-on-idle" />
        {label}
      </span>
    );
  };

  return (
    <Select
      label={t(($) => $.navbar.themeSwitcher.label)}
      value={theme}
      items={[
        {
          label:
            systemTheme === "dark"
              ? t(($) => $.navbar.themeSwitcher.autoDark)
              : t(($) => $.navbar.themeSwitcher.autoLight),
          id: "system",
          content: getContent("system"),
        },
        {
          label: t(($) => $.navbar.themeSwitcher.light),
          id: "light",
          content: getContent("light"),
        },
        {
          label: t(($) => $.navbar.themeSwitcher.dark),
          id: "dark",
          content: getContent("dark"),
        },
      ]}
      customTrigger={
        <IconButton
          variant="ghost"
          icon={theme === "light" || (theme === "system" && systemTheme === "light") ? LightModeIcon : DarkModeIcon}
          label={t(($) => $.navbar.themeSwitcher.label)}
        />
      }
      onChange={(value) => updateTheme(value as ThemeContext.Theme)}
      hideLabel
      ignoreTriggerWidth
    />
  );
};
