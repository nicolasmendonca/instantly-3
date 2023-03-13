import useSWR, { preload, SWRConfiguration, SWRResponse } from "swr";
import produce from "immer";
import {
  createProject,
  Project,
  TaskStatusList,
  Workspace,
} from "src/features/clients/instantlyClient";
import { useInstantlyClient } from "src/features/clients/useInstantlyClient";
import { preloadTasks } from "../../routes/workspaces/[workspaceId]/projects/[projectId]/useTasks";
import { preloadProject } from "../../routes/workspaces/[workspaceId]/projects/[projectId]/useProject";
import { preloadTaskStatuses } from "../../routes/workspaces/[workspaceId]/projects/[projectId]/useTaskStatuses";

type UseProjectsParam = {
  workspaceId: Workspace["id"];
};

type UseProjectsKey = UseProjectsParam & {
  key: "projects";
};

type UseProjectsReturnType = SWRResponse<Project[], any, any> & {
  create: (params: {
    project: Project;
    taskStatuses: TaskStatusList;
    workspaceId: Workspace["id"];
  }) => Promise<void>;
  optimisticMutate: (projects: Project[]) => Promise<void>;
};

export function useProjects(
  { workspaceId }: UseProjectsParam,
  swrConfig: SWRConfiguration = {}
): UseProjectsReturnType {
  const instantlyClient = useInstantlyClient();
  const swr = useSWR<Project[], any, () => UseProjectsKey>(
    () => ({
      key: "projects",
      workspaceId,
    }),
    instantlyClient.getProjectsForWorkspace,
    swrConfig
  );

  const optimisticMutate = async (projects: Project[]) => {
    await swr.mutate(projects, { revalidate: false });
  };

  const create: UseProjectsReturnType["create"] = async ({
    project,
    taskStatuses,
    workspaceId,
  }) => {
    const updatedProjects = produce(swr.data!, (draft) => {
      draft?.push(project);
    });

    await Promise.all([
      createProject(instantlyClient, {
        project,
        taskStatuses,
        workspaceId,
      }),
      preloadTaskStatuses(
        {
          projectId: project.id,
          workspaceId,
        },
        taskStatuses
      ),
      preloadTasks(
        {
          projectId: project.id,
          workspaceId,
        },
        []
      ),
      preloadProject({ projectId: project.id, workspaceId }, project),
      optimisticMutate(updatedProjects),
    ]);
  };

  return { ...swr, create, optimisticMutate };
}

export async function preloadProjects(
  params: UseProjectsParam,
  projects: Project[]
) {
  const key: UseProjectsKey = {
    key: "projects",
    workspaceId: params.workspaceId,
  };
  await preload(key, () => projects);
}
