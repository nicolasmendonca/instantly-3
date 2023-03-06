export type WorkspaceMemberProfile = {
  id: string;
  name: string;
  avatarUrl: string;
  role: "admin" | "member" | "guest";
};
