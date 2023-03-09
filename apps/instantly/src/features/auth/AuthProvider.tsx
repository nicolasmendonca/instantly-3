import React from "react";
import useSWR, { SWRResponse } from "swr";
import { useInstantlyClient } from "src/features/clients/useInstantlyClient";
import type { User } from "src/features/clients/instantlyClient";

function useAuthUser(): SWRResponse<User | null, any, { key: "auth-user" }> {
  const instantlyClient = useInstantlyClient();
  return useSWR<User | null, any, any>(
    { key: "auth-user" },
    instantlyClient.getAuthUser
  );
}

const useInstantlyClientAuth = () => {
  const { data: user, mutate: mutateAuthUser, isLoading } = useAuthUser();
  const instantlyClient = useInstantlyClient();

  React.useEffect(() => {
    const unsubscribe = instantlyClient.subscribeToAuthState(() =>
      mutateAuthUser(user)
    );
    return () => {
      unsubscribe();
    };
  }, []);

  const login = async () => {
    await instantlyClient.loginWithGoogle();
  };

  const logout = async () => {
    await instantlyClient.logout();
  };

  return {
    user,
    login,
    logout,
    isLoading,
  };
};

type UseInstantlyAuthReturnType = ReturnType<typeof useInstantlyClientAuth>;

const AuthContext = React.createContext<undefined | UseInstantlyAuthReturnType>(
  undefined
);

export const AuthProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const result = useInstantlyClientAuth();

  const memoized = React.useMemo(() => {
    return {
      user: result.user,
      login: result.login,
      logout: result.logout,
      isLoading: result.isLoading,
    };
  }, [result.user, result.isLoading]);

  return (
    <AuthContext.Provider value={memoized}>{children}</AuthContext.Provider>
  );
};

export function useAuth(): UseInstantlyAuthReturnType {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within a AuthProvider");
  }
  return context;
}
