import React from "react";
import useSWR from "swr";
import { useInstantlyClient } from "src/features/clients/useInstantlyClient";
import type { User } from "src/features/clients/instantlyClient";
import { useBoolean } from "@chakra-ui/react";

const useInstantlyClientAuth = () => {
  const instantlyClient = useInstantlyClient();
  const swr = useSWR<User | null, any, any>(
    { key: "auth-user" },
    instantlyClient.getAuthUser
  );
  return swr;
};

type UseInstantlyAuthReturnType = {
  login: () => Promise<void>;
  logout: () => Promise<void>;
  user: User | null;
  isLoading: boolean;
};

const AuthContext = React.createContext<undefined | UseInstantlyAuthReturnType>(
  undefined
);

export const AuthProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const { data, mutate, isLoading } = useInstantlyClientAuth();
  const instantlyClient = useInstantlyClient();
  const [hasInitialized, setHasInitialized] = useBoolean(false);

  const login = instantlyClient.loginWithGoogle;
  const logout = instantlyClient.logout;

  React.useEffect(() => {
    const unsubscribe = instantlyClient.subscribeToAuthState(() => {
      mutate(undefined, { revalidate: true });
      setHasInitialized.on();
    });
    return () => {
      unsubscribe();
    };
  }, []);

  const memoized = React.useMemo(() => {
    return {
      user: data ?? null,
      isLoading: !hasInitialized || isLoading,
      login,
      logout,
    };
  }, [data?.id, isLoading, hasInitialized]);

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
