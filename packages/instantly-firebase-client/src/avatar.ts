export function generateWorkspaceAvatar(name: string): string {
  return `https://ui-avatars.com/api/?name=${name.replaceAll(
    " ",
    "+"
  )}&background=0D8ABC&color=fff&rounded=true&bold=true`;
}
