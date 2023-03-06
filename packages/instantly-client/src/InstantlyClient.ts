import type { User, Workspace, Task } from "./entities";

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
  createNewWorkspace: (name: string) => Promise<Workspace["id"]>;

  // Tasks
  getTasksForWorkspace: ({
    workspaceId,
  }: {
    workspaceId: Workspace["id"];
  }) => Promise<Task[]>;
}
