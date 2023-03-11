import React from "react";
import useSWR from "swr";
import { useInstantlyClient } from "src/features/clients/useInstantlyClient";
import type { User } from "src/features/clients/instantlyClient";

const useInstantlyClientAuth = () => {
  const instantlyClient = useInstantlyClient();
  const { data, mutate, isLoading } = useSWR<User | null, any, any>(
    { key: "auth-user" },
    instantlyClient.getAuthUser
  );

  React.useEffect(() => {
    const unsubscribe = instantlyClient.subscribeToAuthState(() =>
      mutate(undefined, { revalidate: true })
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
    user: data,
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
    return result;
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
