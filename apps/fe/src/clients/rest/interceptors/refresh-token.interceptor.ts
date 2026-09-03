import { RestInterceptor } from "@povio/ui";

import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from "@/config/jwt.config";
import { UserAuthApi } from "@/openapi/userAuth/userAuth.api";
import { ErrorUtils } from "@/utils/error.utils";

export const RefreshTokenInterceptor = new RestInterceptor((client) => {
  return client.interceptors.response.use(
    (response) => response,
    // oxlint-disable-next-line promise/prefer-await-to-callbacks
    async (error) => {
      const originalRequest = error.config;

      if (error.response.data?.code === ErrorUtils.ErrorCodes.InvalidCredentials) {
        return Promise.reject(error);
      }

      if (error.response.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        try {
          const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
          const { accessToken, refreshToken: newRefreshToken } = await UserAuthApi.accessToken({
            refreshToken: refreshToken || "",
          });
          localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
          localStorage.setItem(REFRESH_TOKEN_KEY, newRefreshToken || "");
          originalRequest.headers["Authorization"] = `Bearer ${accessToken}`;

          return client(originalRequest);
        } catch {
          localStorage.removeItem(ACCESS_TOKEN_KEY);
          localStorage.removeItem(REFRESH_TOKEN_KEY);
        }
      }
      return Promise.reject(error);
    },
  );
});
