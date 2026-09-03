/* oxlint-disable react/no-unknown-property */

import { UIRouter } from "@povio/ui";
import { withThemeByClassName } from "@storybook/addon-themes";
import type { Decorator, Preview, ReactRenderer } from "@storybook/react-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React, { Suspense } from "react";
import { I18nextProvider } from "react-i18next";

import i18n from "@/config/i18n";
import { Fonts, globalFontClass } from "@/styles/fonts";
import "@/styles/globals.css";

const noop = () => {
  return Promise.resolve(true);
};

// Wrap your stories in the I18nextProvider component
const withI18next: Decorator = (Story) => {
  const queryClient = new QueryClient();

  return (
    // This catches the suspense from components not yet ready (still loading translations)
    // Alternative: set useSuspense to false on i18next.options.react when initializing i18next
    <Suspense fallback={<div>loading translations...</div>}>
      <UIRouter.UIRouterProvider
        push={noop}
        replace={noop}
        pathname="/storybook"
        searchString=""
      >
        <QueryClientProvider client={queryClient}>
          <I18nextProvider i18n={i18n}>
            <Fonts />
            <div className={globalFontClass}>
              <Story />
            </div>
          </I18nextProvider>
        </QueryClientProvider>
      </UIRouter.UIRouterProvider>
    </Suspense>
  );
};

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: "^on[A-Z].*" },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
    docs: {
      codePanel: true,
    },
  },
  decorators: [
    withThemeByClassName<ReactRenderer>({
      themes: {
        Default: "",
        Dark: "dark",
        FE: "fe",
        Admin: "admin",
      },
      defaultTheme: "Default",
    }),
    withI18next,
  ],
};

export default preview;
