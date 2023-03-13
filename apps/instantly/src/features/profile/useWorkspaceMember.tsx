import useSWR, { preload, SWRResponse } from "swr";
import {
  User,
  Workspace,
  WorkspaceMember,
} from "src/features/clients/instantlyClient";
import { useInstantlyClient } from "src/features/clients/useInstantlyClient";

type UseWorkspaceMemberParam = {
  workspaceId: Workspace["id"];
  memberId: User["id"];
};

type UseWorkspaceMemberKey = UseWorkspaceMemberParam & {
  key: "workspace-member";
};

export function useWorkspaceMember({
  workspaceId,
  memberId,
}: UseWorkspaceMemberParam): SWRResponse<
  WorkspaceMember,
  any,
  UseWorkspaceMemberKey
> {
  const instantlyClient = useInstantlyClient();
  return useSWR<WorkspaceMember, any, () => UseWorkspaceMemberKey>(
    () => ({
      key: "workspace-member",
      workspaceId,
      memberId,
    }),
    instantlyClient.getWorkspaceMember
  );
}

export async function preloadWorkspaceMember(
  params: UseWorkspaceMemberParam,
  workspaceMember: WorkspaceMember
) {
  const { workspaceId, memberId } = params;
  const key: UseWorkspaceMemberKey = {
    key: "workspace-member",
    workspaceId,
    memberId,
  };
  await preload(key, () => workspaceMember);
}
