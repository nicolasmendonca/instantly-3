import React, { useState }  from 'react';
import { instantlyClient, type User } from "src/clients/instantlyClient";

const useInstantlyClientAuth = () => {
  const [user, setUser] = useState<User>();

  React.useEffect(() => {
    const unsubscribe = instantlyClient.subscribeToAuthState(setUser, () =>
      setUser(undefined)
    );
    return () => {
      unsubscribe();
    };
  }, [setUser]);

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
  };
};


type UseInstantlyAuthReturnType = ReturnType<typeof useInstantlyClientAuth>;

const AuthContext = React.createContext<undefined | UseInstantlyAuthReturnType>(undefined);

export const AuthProvider: React.FC<{
  children: React.ReactNode
}> = ({ children }) => {
  const result = useInstantlyClientAuth()

  const memoized = React.useMemo(() => {
    return {
      user: result.user,
      login: result.login,
      logout: result.logout      
    }
  }, [result.user])

  return (
    <AuthContext.Provider value={memoized}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = (): UseInstantlyAuthReturnType => {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within a AuthProvider');
  }
  return context;
}
