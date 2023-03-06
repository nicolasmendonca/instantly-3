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
  getWorkspacesForUser: ({
    userId,
  }: {
    userId: User["id"];
  }) => Promise<Workspace[]>;
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
  createProject: ({
    workspaceId,
    name,
  }: {
    workspaceId: Workspace["id"];
    name: string;
  }) => Promise<Project["id"]>;

  // Tasks
  getTasksForWorkspace: ({
    workspaceId,
  }: {
    workspaceId: Workspace["id"];
  }) => Promise<Task[]>;
}
