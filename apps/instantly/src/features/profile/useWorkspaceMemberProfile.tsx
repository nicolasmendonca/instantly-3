import useSWR, { SWRResponse } from "swr";
import {
  User,
  Workspace,
  WorkspaceMemberProfile,
} from "src/features/clients/instantlyClient";
import { useInstantlyClient } from "src/features/clients/useInstantlyClient";

type UseWorkspaceMemberProfileParam = {
  workspaceId: Workspace["id"];
  memberId: User["id"];
};

type UseWorkspaceMemberProfileKey = UseWorkspaceMemberProfileParam & {
  key: "workspace-member";
};

export function useWorkspaceMemberProfile({
  workspaceId,
  memberId,
}: UseWorkspaceMemberProfileParam): SWRResponse<
  WorkspaceMemberProfile,
  any,
  UseWorkspaceMemberProfileKey
> {
  const instantlyClient = useInstantlyClient();
  return useSWR<
    WorkspaceMemberProfile,
    any,
    () => UseWorkspaceMemberProfileKey
  >(
    () => ({
      key: "workspace-member",
      workspaceId,
      memberId,
    }),
    instantlyClient.getWorkspaceMemberProfile
  );
}
