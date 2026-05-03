// @ts-nocheck — trpc hooks typed via server-side AppRouter in api/router.ts.
// Full type safety available via: npx tsc -p tsconfig.server.json
import { trpc } from "@/providers/trpc";
import { useCallback, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";

type UseAuthOptions = {
  redirectOnUnauthenticated?: boolean;
  redirectPath?: string;
};

export function useAuth(options?: UseAuthOptions) {
  const { redirectOnUnauthenticated = false, redirectPath = "/login" } =
    options ?? {};

  const navigate = useNavigate();
  const utils = trpc.useUtils();

  // Check OAuth auth
  const {
    data: oauthUser,
    isLoading: oauthLoading,
    error: oauthError,
  } = trpc.auth.me.useQuery(undefined, {
    staleTime: 1000 * 60 * 5,
    retry: false,
  });

  // Check local auth
  const {
    data: localUser,
    isLoading: localLoading,
    error: localError,
  } = trpc.localAuth.me.useQuery(undefined, {
    staleTime: 1000 * 60 * 5,
    retry: false,
    enabled: !oauthUser && !!localStorage.getItem("cinex_token"),
  });

  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: async () => {
      await utils.invalidate();
    },
  });

  const user = oauthUser ?? localUser ?? null;
  const isLoading = oauthLoading || localLoading;
  const error = oauthError || localError;

  const logout = useCallback(() => {
    localStorage.removeItem("cinex_token");
    logoutMutation.mutate();
    window.location.href = "/login";
  }, [logoutMutation]);

  useEffect(() => {
    if (redirectOnUnauthenticated && !isLoading && !user) {
      const currentPath = window.location.pathname;
      if (currentPath !== redirectPath) {
        navigate(redirectPath);
      }
    }
  }, [redirectOnUnauthenticated, isLoading, user, navigate, redirectPath]);

  return useMemo(
    () => ({
      user: user ?? null,
      isAuthenticated: !!user,
      isLoading: isLoading || logoutMutation.isPending,
      error,
      logout,
      refresh: () => utils.invalidate(),
    }),
    [user, isLoading, logoutMutation.isPending, error, logout, utils],
  );
}
