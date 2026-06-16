interface GroupChatConfig {
  agentIds: string[];
  sessionName?: string;
}

export function generateGroupChatInviteToken(groupConfig: GroupChatConfig): string {
  const json = JSON.stringify({
    agentIds: groupConfig.agentIds,
    ...(groupConfig.sessionName ? { sessionName: groupConfig.sessionName } : {}),
  });
  return btoa(json).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function parseGroupChatInviteToken(token: string): GroupChatConfig | null {
  try {
    const padded = token.replace(/-/g, '+').replace(/_/g, '/');
    const padding = (4 - (padded.length % 4)) % 4;
    const base64 = padded + '='.repeat(padding);
    const json = atob(base64);
    const parsed = JSON.parse(json);
    if (!Array.isArray(parsed.agentIds)) return null;
    return {
      agentIds: parsed.agentIds,
      ...(typeof parsed.sessionName === 'string'
        ? { sessionName: parsed.sessionName }
        : {}),
    };
  } catch {
    return null;
  }
}
