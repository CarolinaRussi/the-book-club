export function buildInviteUrl(invitationCode: string): string {
  return `${window.location.origin}/convite/${invitationCode}`;
}
