import { Confirmation, ThemeContext, ToastContainer, UIConfig, UIRouter } from "@povio/ui";
import { TanStackDevtools } from "@tanstack/react-devtools";
import { ReactQueryDevtoolsPanel } from "@tanstack/react-query-devtools";
import { Outlet, createRootRoute, useLocation, useNavigate } from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";

import GoogleAnalytics from "@/components/googleAnalytics/GoogleAnalytics";
import { DefaultAppHead } from "@/components/shared/head/DefaultAppHead";
import { Fonts } from "@/styles/fonts/fonts";
import "@/config/i18n";

import { initA11y } from "@/config/inits/a11y";
import { initLogger } from "@/config/inits/logger";
import { initSentry } from "@/config/inits/sentry";
import Providers from "@/providers";
import { AppErrorBoundary } from "@/providers/AppErrorBoundary";
import "@/styles/globals.css";

import { onCLS, onINP, onLCP } from "web-vitals";

import { NotFoundPage } from "@/components/404";
import { AppConfig } from "@/config/app.config";

initLogger();
initSentry();
initA11y();

const Root = () => {
  const { i18n } = useTranslation();

  const navigate = useNavigate();
  const location = useLocation();

  const push = useCallback(
    async (to: string) => {
      await navigate({ to });
      return true;
    },
    [navigate],
  );

  const replace = useCallback(
    async (to: string) => {
      await navigate({ to, replace: true });
      return true;
    },
    [navigate],
  );

  const { pathname, searchStr } = location;

  useEffect(() => {
    i18n.on("languageChanged", (lng) => {
      if (typeof document !== "undefined") {
        document.documentElement.setAttribute("lang", lng);
      }
    });
  }, [i18n]);

  if (AppConfig.enableWebVitals) {
    onCLS(console.log);
    onINP(console.log);
    onLCP(console.log);
  }

  return (
    <>
      <GoogleAnalytics />
      <AppErrorBoundary>
        <Providers
          providers={[
            { provider: ThemeContext.ThemeContextProvider },
            {
              provider: UIRouter.UIRouterProvider,
              props: { push, replace, searchString: searchStr, pathname },
            },
            { provider: UIConfig.Provider },
            { provider: Confirmation.Provider },
          ]}
        >
          <Fonts />
          <DefaultAppHead />
          <Outlet />
          <ToastContainer />
          <TanStackDevtools
            plugins={[
              {
                name: "TanStack Query",
                render: <ReactQueryDevtoolsPanel />,
                defaultOpen: true,
              },
              {
                name: "TanStack Router",
                render: <TanStackRouterDevtoolsPanel />,
                defaultOpen: false,
              },
            ]}
          />
        </Providers>
      </AppErrorBoundary>
    </>
  );
};

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { name: "theme-color", content: "#ffffff" },
      { title: "App" },
      { name: "msapplication-TileColor", content: "#da532c" },
    ],
    links: [
      { rel: "apple-touch-icon", sizes: "180x180", href: "/apple-touch-icon.png" },
      { rel: "icon", type: "image/png", sizes: "32x32", href: "/favicon-32x32.png" },
      { rel: "icon", type: "image/png", sizes: "16x16", href: "/favicon-16x16.png" },
      { rel: "manifest", href: "/site.webmanifest" },
      { rel: "mask-icon", href: "/safari-pinned-tab.svg", color: "#5bbad5" },
    ],
  }),
  component: Root,
  notFoundComponent: NotFoundPage,
});
