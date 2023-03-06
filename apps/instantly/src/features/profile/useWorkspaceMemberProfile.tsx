import useSWR, { SWRResponse } from "swr";
import {
  instantlyClient,
  User,
  Workspace,
  WorkspaceMemberProfile,
} from "../../clients/instantlyClient";

export const useWorkspaceMemberProfile = ({
  workspaceId,
  memberId,
}: {
  workspaceId: Workspace["id"];
  memberId: User["id"];
}): SWRResponse<WorkspaceMemberProfile, any, any> => {
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
