import { User } from "./User";

export type Workspace = {
  id: string;
  name: string;
  avatarUrl: string;
  userCreatorId: User["id"];
};
