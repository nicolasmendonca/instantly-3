import type {
  User,
  Workspace,
  Task,
  WorkspaceMember,
  Project,
  TaskStatus,
} from "./";

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
  createNewWorkspace: (params: {
    workspace: Workspace;
    workspaceMember: WorkspaceMember;
  }) => Promise<void>;
  getWorkspaceMember: (params: {
    workspaceId: Workspace["id"];
    memberId: User["id"];
  }) => Promise<WorkspaceMember>;

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
    project: Project;
    taskStatuses: TaskStatus[];
  }) => Promise<void>;

  // Tasks
  getTasksForProject: (params: {
    workspaceId: Workspace["id"];
    projectId: Project["id"];
    filters: {
      archived?: boolean;
      status?: TaskStatus["id"];
    };
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
    },
    taskPayload: Task
  ) => Promise<void>;
  updateTask: (
    params: {
      workspaceId: Workspace["id"];
      projectId: Project["id"];
    },
    task: Task
  ) => Promise<void>;
  deleteTask: (params: {
    taskId: Task["id"];
    workspaceId: Workspace["id"];
    projectId: Project["id"];
  }) => Promise<void>;

  // Task Statuses
  getTaskStatuses: (params: {
    workspaceId: Workspace["id"];
    projectId: Project["id"];
  }) => Promise<TaskStatus[]>;
}
