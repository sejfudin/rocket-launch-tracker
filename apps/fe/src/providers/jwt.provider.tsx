import { AuthContext } from "@povio/ui/auth";
import { useQueryClient } from "@tanstack/react-query";
import { type PropsWithChildren, useCallback, useMemo, useState } from "react";

import { LoadingState } from "@/components/shared/layout/LoadingState";
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from "@/config/jwt.config";
import { UserApi } from "@/openapi/user/user.api";
import type { UserModels } from "@/openapi/user/user.models";
import { UserQueries } from "@/openapi/user/user.queries";

const routes: AuthContext.Routes = {
  authenticated: "/",
  unauthenticated: "/login",
};

export const JWTProvider = ({ children }: PropsWithChildren) => {
  const queryClient = useQueryClient();
  const [accessToken, setAccessToken] = useState<string | null | undefined>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(ACCESS_TOKEN_KEY);
    }

    return null;
  });

  const authenticated = !!accessToken;
  const isInitializing = accessToken === undefined;

  const { data: user } = UserQueries.useGet({
    enabled: authenticated,
    staleTime: 10 * 60 * 1000,
  });

  const onAccessTokenChange = useCallback((token: string | null) => {
    if (token) {
      localStorage.setItem(ACCESS_TOKEN_KEY, token);
    } else {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
    }

    setAccessToken(token);
  }, []);

  const onRefreshTokenChange = useCallback((token: string | null) => {
    if (token) {
      localStorage.setItem(REFRESH_TOKEN_KEY, token);
    } else {
      localStorage.removeItem(REFRESH_TOKEN_KEY);
    }
  }, []);

  const logout = useCallback(() => {
    onAccessTokenChange(null);
    onRefreshTokenChange(null);
    queryClient.clear();
  }, [queryClient, onAccessTokenChange, onRefreshTokenChange]);

  const userPromise = useCallback(async () => {
    try {
      const user = await UserApi.get();
      queryClient.setQueryData<UserModels.UserMeResponse>(UserQueries.keys.get(), user);
      return user;
    } catch {
      logout();
      return null;
    }
  }, [logout, queryClient]);

  const updateTokens = useCallback(
    (accessToken: string | null, refreshToken?: string | null) => {
      if (accessToken !== null) {
        onAccessTokenChange(accessToken);
      }
      if (refreshToken !== null && refreshToken !== undefined) {
        onRefreshTokenChange(refreshToken);
      }
    },
    [onAccessTokenChange, onRefreshTokenChange],
  );

  const loadingState = useMemo(() => <LoadingState />, []);

  return (
    <AuthContext.Provider
      isAuthenticated={authenticated}
      isInitializing={isInitializing}
      logout={logout}
      updateTokens={updateTokens}
      accessToken={accessToken}
      user={user}
      userPromise={userPromise}
      routes={routes}
      loadingState={loadingState}
    >
      {children}
    </AuthContext.Provider>
  );
};
