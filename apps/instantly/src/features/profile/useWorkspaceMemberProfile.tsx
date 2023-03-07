import useSWR, { SWRResponse } from "swr";
import {
  User,
  Workspace,
  WorkspaceMemberProfile,
} from "src/features/clients/instantlyClient";
import { useInstantlyClient } from "src/features/clients/useInstantlyClient";

export const useWorkspaceMemberProfile = ({
  workspaceId,
  memberId,
}: {
  workspaceId: Workspace["id"];
  memberId: User["id"];
}): SWRResponse<WorkspaceMemberProfile, any, any> => {
  const instantlyClient = useInstantlyClient();
  return useSWR<
    WorkspaceMemberProfile,
    any,
    () => ["workspaces", Workspace["id"], "member", User["id"]]
  >(
    () => ["workspaces", workspaceId, "member", memberId],
    ([, workspaceId, , memberId]) =>
      instantlyClient.getWorkspaceMemberProfile({ workspaceId, memberId })
  );
};
