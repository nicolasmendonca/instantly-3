import {
  createWorkspace,
  User,
  Workspace,
  WorkspaceMember,
  workspaceMemberSchema,
} from "instantly-core";
import useSWR, { preload, SWRResponse } from "swr";
import { useAuth } from "src/features/auth/AuthProvider";
import { useInstantlyClient } from "src/features/clients/useInstantlyClient";
import produce from "immer";
import { preloadWorkspace } from "../../features/workspaces/useWorkspace";
import { preloadProjects } from "../../features/projects/useProjects";
import { preloadWorkspaceMember } from "../../features/profile/useWorkspaceMember";

type UseWorkspacesKey = {
  userId: User["id"];
  key: "workspaces";
};

type UseWorkspacesReturnType = SWRResponse<
  Workspace[],
  any,
  () => UseWorkspacesKey
> & {
  create: (workspace: Workspace) => Promise<void>;
};

export function useWorkspaces(): UseWorkspacesReturnType {
  const { user } = useAuth();
  const instantlyClient = useInstantlyClient();
  const swr = useSWR<Workspace[], any, () => UseWorkspacesKey>(
    () => ({ userId: user!.id, key: "workspaces" }),
    instantlyClient.getWorkspacesForUser
  );

  const optimisticMutate = async (...args: Parameters<typeof swr.mutate>) => {
    await swr.mutate(args[0], { revalidate: false });
  };

  const create: UseWorkspacesReturnType["create"] = async (
    workspacePayload
  ) => {
    if (!user) {
      throw new Error("User is not logged in");
    }

    // Create workspace
    const workspaceMember: WorkspaceMember = {
      id: user.id,
      role: "admin",
      avatarUrl: user.avatarUrl,
      name: user.name,
    };

    const updatedWorkspaces = produce(swr.data, (draft) => {
      draft?.push(workspacePayload);
    });
    await Promise.all([
      createWorkspace(instantlyClient, {
        workspace: workspacePayload,
        workspaceMember,
      }),
      optimisticMutate(updatedWorkspaces),
      preloadWorkspace({ workspaceId: workspacePayload.id }, workspacePayload),
      preloadProjects({ workspaceId: workspacePayload.id }, []),
      preloadWorkspaceMember(
        {
          memberId: user.id,
          workspaceId: workspacePayload.id,
        },
        workspaceMember
      ),
    ]);
  };

  return { ...swr, create };
}
