import { LinkContext, type LinkNavigationProps } from "@povio/ui";
import { AbilityContext } from "@povio/ui/auth";
import { QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider, createLink, createRouter } from "@tanstack/react-router";
import { type ComponentType, StrictMode } from "react";
import { Link as AriaLink } from "react-aria-components";
import ReactDOM from "react-dom/client";

import { queryClient } from "@/config/query.config";
import Providers from "@/providers";
import { JWTProvider } from "@/providers/jwt.provider";

import { routeTree } from "./routeTree.gen";

const LinkComponent = createLink(AriaLink) as unknown as ComponentType<LinkNavigationProps>;

const router = createRouter({
  routeTree,
  defaultPreload: "intent",
  scrollRestoration: true,
  defaultStructuralSharing: true,
  defaultPreloadStaleTime: 0,
  basepath: import.meta.env.BASE_URL,
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

const rootElement = document.getElementById("app");

if (rootElement && !rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <StrictMode>
      <Providers
        providers={[
          {
            provider: LinkContext.LinkContextProvider,
            props: { LinkComponent },
          },
          {
            provider: QueryClientProvider,
            props: { client: queryClient },
          },
          {
            provider: JWTProvider,
          },
          {
            provider: AbilityContext.Provider,
          },
        ]}
      >
        <RouterProvider router={router} />
      </Providers>
    </StrictMode>,
  );
}
