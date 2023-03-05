import type { User } from "./entities/User";

type UnsubscribeFn = () => void;

export interface InstantlyClient {
  // Authentication
  subscribeToAuthState: (
    onLogin: (user: User) => void,
    onLogout: () => void
  ) => UnsubscribeFn;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;

  // Workspaces
  createNewWorkspace: (name: string) => Promise<void>;
}
