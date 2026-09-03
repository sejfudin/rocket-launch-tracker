import { RestInterceptor } from "@povio/ui";

import { ACCESS_TOKEN_KEY } from "@/config/jwt.config";

export const AuthorizationHeaderInterceptor = new RestInterceptor((client) => {
  return client.interceptors.request.use(async (config) => {
    const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
    if (accessToken != null) {
      // oxlint-disable-next-line no-param-reassign
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  });
});
