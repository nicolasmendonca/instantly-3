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
  getAuthUser: () => Promise<User | null>;
  subscribeToAuthState: (callback: () => void) => UnsubscribeFn;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;

  // Workspaces
  getWorkspacesForUser: (params: {
    userId: User["id"];
  }) => Promise<Workspace[]>;
  getWorkspace: (params: {
    workspaceId: Workspace["id"];
  }) => Promise<Workspace>;
  createNewWorkspace: (name: string) => Promise<Workspace["id"]>;
  getWorkspaceMemberProfile: (params: {
    workspaceId: Workspace["id"];
    memberId: User["id"];
  }) => Promise<WorkspaceMemberProfile>;

  // Projects
  getProjectsForWorkspace: (params: {
    workspaceId: Workspace["id"];
  }) => Promise<Project[]>;
  getProjectForWorkspace: (params: {
    workspaceId: Workspace["id"];
    projectId: Project["id"];
  }) => Promise<Project>;
  createProject: (params: {
    workspaceId: Workspace["id"];
    name: string;
  }) => Promise<Project["id"]>;

  // Tasks
  getTasksForProject: (params: {
    workspaceId: Workspace["id"];
    projectId: Project["id"];
  }) => Promise<Task[]>;
  getTaskForProject: (params: {
    workspaceId: Workspace["id"];
    projectId: Project["id"];
    taskId: Task["id"];
  }) => Promise<Task>;
  createTask: (
    params: {
      workspaceId: Workspace["id"];
      projectId: Project["id"];
      userId: User["id"];
    },
    taskPayload: Omit<Task, "id">
  ) => Promise<Task>;
  updateTask: (
    params: {
      taskId: Task["id"];
      workspaceId: Workspace["id"];
      projectId: Project["id"];
    },
    task: Task
  ) => Promise<void>;
}
