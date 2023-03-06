import type {
  User,
  Workspace,
  Task,
  WorkspaceMemberProfile,
  Project,
} from "./entities";

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
  getWorkspace: ({
    workspaceId,
  }: {
    workspaceId: Workspace["id"];
  }) => Promise<Workspace>;
  createNewWorkspace: (name: string) => Promise<Workspace["id"]>;
  getWorkspaceMemberProfile: ({
    workspaceId,
    memberId,
  }: {
    workspaceId: Workspace["id"];
    memberId: User["id"];
  }) => Promise<WorkspaceMemberProfile>;

  // Projects
  getProjectsForWorkspace: ({
    workspaceId,
  }: {
    workspaceId: Workspace["id"];
  }) => Promise<Project[]>;

  // Tasks
  getTasksForWorkspace: ({
    workspaceId,
  }: {
    workspaceId: Workspace["id"];
  }) => Promise<Task[]>;
}
